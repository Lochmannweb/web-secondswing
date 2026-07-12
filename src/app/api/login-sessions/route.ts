import {
  DEVICE_TYPE_LABELS,
  type DeviceType,
  type LoginSession,
} from "@/app/lib/securitySettings";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_SESSIONS_TABLE = "login_sessions";
const MAX_LOGIN_SESSIONS = 8;

type SessionPayload = {
  deviceKey?: string;
  label?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
};

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABEBASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getAuthClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function isMissingTableError(message: string | undefined) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("login_sessions") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache") ||
      lower.includes("relation"))
  );
}

function normalizeDeviceType(value: string | undefined): DeviceType {
  if (value && value in DEVICE_TYPE_LABELS) {
    return value as DeviceType;
  }
  return "ukendt";
}

function mapRowsToSessions(
  rows: Array<{
    device_key: string;
    label: string;
    device_type: string;
    browser: string;
    os: string;
    last_active_at: string;
  }>,
  currentDeviceKey: string
): LoginSession[] {
  return rows.map((row) => {
    const deviceType = normalizeDeviceType(row.device_type);
    return {
      id: row.device_key,
      label: row.label || DEVICE_TYPE_LABELS[deviceType],
      deviceType,
      browser: row.browser,
      os: row.os,
      lastActiveAt: row.last_active_at,
      isCurrent: row.device_key === currentDeviceKey,
    };
  });
}

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!accessToken) {
    return { user: null, error: "Unauthorized" as const };
  }

  const authClient = getAuthClient(accessToken);
  if (!authClient) {
    return { user: null, error: "Server configuration fejl" as const };
  }

  const { data, error } = await authClient.auth.getUser(accessToken);
  if (error || !data.user) {
    return { user: null, error: "Unauthorized" as const };
  }

  return { user: data.user, error: null };
}

async function fetchSessionsForUser(userId: string, currentDeviceKey: string) {
  const serviceClient = getServiceClient();
  if (!serviceClient) {
    return { sessions: [] as LoginSession[], tableMissing: false, error: "Server configuration fejl" };
  }

  const { data, error } = await serviceClient
    .from(LOGIN_SESSIONS_TABLE)
    .select("device_key, label, device_type, browser, os, last_active_at")
    .eq("user_id", userId)
    .order("last_active_at", { ascending: false })
    .limit(MAX_LOGIN_SESSIONS);

  if (error) {
    return {
      sessions: [] as LoginSession[],
      tableMissing: isMissingTableError(error.message),
      error: error.message,
    };
  }

  return {
    sessions: mapRowsToSessions(data ?? [], currentDeviceKey),
    tableMissing: false,
    error: null,
  };
}

export async function GET(req: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const currentDeviceKey = req.nextUrl.searchParams.get("deviceKey") ?? "";
  const result = await fetchSessionsForUser(user.id, currentDeviceKey);

  if (result.tableMissing) {
    return NextResponse.json({ sessions: [], tableMissing: true });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ sessions: result.sessions, tableMissing: false });
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  let payload: SessionPayload;
  try {
    payload = (await req.json()) as SessionPayload;
  } catch {
    return NextResponse.json({ error: "Ugyldigt request body" }, { status: 400 });
  }

  const deviceKey = payload.deviceKey?.trim();
  if (!deviceKey) {
    return NextResponse.json({ error: "deviceKey mangler" }, { status: 400 });
  }

  const serviceClient = getServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: "Server configuration fejl" }, { status: 500 });
  }

  const deviceType = normalizeDeviceType(payload.deviceType);
  const now = new Date().toISOString();

  const { error: upsertError } = await serviceClient.from(LOGIN_SESSIONS_TABLE).upsert(
    {
      user_id: user.id,
      device_key: deviceKey,
      label: payload.label ?? DEVICE_TYPE_LABELS[deviceType],
      device_type: deviceType,
      browser: payload.browser ?? "Browser",
      os: payload.os ?? "Ukendt",
      last_active_at: now,
    },
    { onConflict: "user_id,device_key" }
  );

  if (upsertError) {
    if (isMissingTableError(upsertError.message)) {
      return NextResponse.json({ sessions: [], tableMissing: true });
    }
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const result = await fetchSessionsForUser(user.id, deviceKey);
  if (result.error && !result.tableMissing) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    sessions: result.sessions,
    tableMissing: false,
  });
}
