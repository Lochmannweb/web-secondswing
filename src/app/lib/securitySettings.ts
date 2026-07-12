import type { SupabaseClient } from "@supabase/supabase-js";
import { searchProfiles as searchProfilesApi } from "@/app/lib/profilesApi";

export type DeviceType = "mobil" | "ipad" | "tablet" | "baerbar" | "ukendt";

export type LoginSession = {
  id: string;
  label: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  lastActiveAt: string;
  isCurrent: boolean;
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  mobil: "Mobil",
  ipad: "iPad",
  tablet: "Tablet",
  baerbar: "Bærbar",
  ukendt: "Ukendt enhed",
};

export type BlockedUser = {
  id: string;
  displayName: string;
  blockedAt: string;
};

export type UserReport = {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  details: string;
  createdAt: string;
};

export type SecuritySettings = {
  twoFactorEnabled: boolean;
  blockedUsers: BlockedUser[];
  reports: UserReport[];
  loginSessions: LoginSession[];
};

export const REPORT_REASONS = [
  "Spam eller reklame",
  "Upassende adfærd",
  "Svindel eller bedrageri",
  "Falsk eller vildledende annonce",
  "Andet",
] as const;

const DEFAULT_SETTINGS: SecuritySettings = {
  twoFactorEnabled: false,
  blockedUsers: [],
  reports: [],
  loginSessions: [],
};

function parseBlockedUsers(raw: unknown): BlockedUser[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object" && typeof item.id === "string")
    .map((item) => ({
      id: item.id as string,
      displayName: (item.displayName as string) ?? "Bruger",
      blockedAt: (item.blockedAt as string) ?? new Date().toISOString(),
    }));
}

function parseReports(raw: unknown): UserReport[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object" && typeof item.reportedUserId === "string")
    .map((item) => ({
      id: (item.id as string) ?? crypto.randomUUID(),
      reportedUserId: item.reportedUserId as string,
      reportedUserName: (item.reportedUserName as string) ?? "Bruger",
      reason: (item.reason as string) ?? "Andet",
      details: (item.details as string) ?? "",
      createdAt: (item.createdAt as string) ?? new Date().toISOString(),
    }));
}

function inferDeviceType(item: Record<string, unknown>): DeviceType {
  const stored = item.deviceType as DeviceType | undefined;
  if (stored && stored in DEVICE_TYPE_LABELS) return stored;

  const label = String(item.label ?? "").toLowerCase();
  const os = String(item.os ?? "").toLowerCase();
  if (label.includes("iphone") || os === "ios" && label.includes("mobil")) return "mobil";
  if (label.includes("ipad") || os === "ipados") return "ipad";
  if (label.includes("android") && label.includes("tablet")) return "tablet";
  if (os === "android") return "mobil";
  if (os === "windows" || os === "macos" || os === "linux") return "baerbar";
  return "ukendt";
}

function parseLoginSessions(raw: unknown): LoginSession[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object" && typeof item.id === "string")
    .map((item) => {
      const record = item as Record<string, unknown>;
      const deviceType = inferDeviceType(record);
      return {
        id: record.id as string,
        label: (record.label as string) ?? DEVICE_TYPE_LABELS[deviceType],
        deviceType,
        browser: (record.browser as string) ?? "Browser",
        os: (record.os as string) ?? "Ukendt",
        lastActiveAt: (record.lastActiveAt as string) ?? new Date().toISOString(),
        isCurrent: Boolean(record.isCurrent),
      };
    });
}

export function parseSecuritySettings(
  raw: unknown,
  metadata?: Record<string, unknown> | null
): SecuritySettings {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_SETTINGS,
      twoFactorEnabled: Boolean(metadata?.two_factor_enabled),
    };
  }
  const input = raw as Partial<SecuritySettings>;
  return {
    twoFactorEnabled:
      input.twoFactorEnabled !== undefined
        ? Boolean(input.twoFactorEnabled)
        : Boolean(metadata?.two_factor_enabled),
    blockedUsers: parseBlockedUsers(input.blockedUsers),
    reports: parseReports(input.reports),
    loginSessions: parseLoginSessions(input.loginSessions),
  };
}

export function getDeviceInfo(): {
  browser: string;
  os: string;
  deviceType: DeviceType;
  label: string;
} {
  if (typeof navigator === "undefined") {
    return { browser: "Browser", os: "Ukendt", deviceType: "ukendt", label: "Ukendt enhed" };
  }

  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";

  const isIPad =
    /iPad/.test(ua) ||
    (navigator.maxTouchPoints > 1 && /MacIntel/.test(navigator.platform));
  const isIPhone = /iPhone/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isAndroidPhone = isAndroid && /Mobile/.test(ua);
  const isAndroidTablet = isAndroid && !/Mobile/.test(ua);

  let os = "Ukendt";
  if (isIPhone || isIPad) os = isIPad ? "iPadOS" : "iOS";
  else if (isAndroid) os = "Android";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType: DeviceType = "ukendt";
  if (isIPhone || isAndroidPhone) deviceType = "mobil";
  else if (isIPad) deviceType = "ipad";
  else if (isAndroidTablet) deviceType = "tablet";
  else if (os === "Windows" || os === "macOS" || os === "Linux" || os === "ChromeOS") {
    deviceType = "baerbar";
  }

  const label = DEVICE_TYPE_LABELS[deviceType];

  return { browser, os, deviceType, label };
}

const SESSION_STORAGE_KEY = "ss-session-id";
const LOGIN_SESSIONS_TABLE = "login_sessions";
const MAX_LOGIN_SESSIONS = 8;

export function getCurrentDeviceKey(): string {
  if (typeof window === "undefined") return crypto.randomUUID();

  const read = (storage: Storage) => {
    try {
      return storage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const write = (storage: Storage, value: string) => {
    try {
      storage.setItem(SESSION_STORAGE_KEY, value);
      return true;
    } catch {
      return false;
    }
  };

  const existing =
    read(window.localStorage) ??
    read(window.sessionStorage);

  if (existing) {
    write(window.localStorage, existing);
    write(window.sessionStorage, existing);
    return existing;
  }

  const id = crypto.randomUUID();
  write(window.localStorage, id);
  write(window.sessionStorage, id);
  return id;
}

function buildSessionId() {
  return getCurrentDeviceKey();
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

type LoginSessionRow = {
  id: string;
  device_key: string;
  label: string;
  device_type: string;
  browser: string;
  os: string;
  last_active_at: string;
};

function rowToLoginSession(row: LoginSessionRow, currentDeviceKey: string): LoginSession {
  const deviceType = inferDeviceType({
    deviceType: row.device_type,
    label: row.label,
    os: row.os,
  });
  return {
    id: row.device_key,
    label: row.label || DEVICE_TYPE_LABELS[deviceType],
    deviceType,
    browser: row.browser,
    os: row.os,
    lastActiveAt: row.last_active_at,
    isCurrent: row.device_key === currentDeviceKey,
  };
}

function buildLocalLoginSession(
  deviceKey: string,
  device: ReturnType<typeof getDeviceInfo>,
  now: string
): LoginSession {
  return {
    id: deviceKey,
    label: device.label,
    deviceType: device.deviceType,
    browser: device.browser,
    os: device.os,
    lastActiveAt: now,
    isCurrent: true,
  };
}

async function getAccessToken(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) return null;
  return data.session.access_token;
}

async function syncLoginSessionsViaApi(
  supabase: SupabaseClient,
  deviceKey: string,
  device: ReturnType<typeof getDeviceInfo>
): Promise<{ sessions: LoginSession[] | null; tableMissing: boolean }> {
  const accessToken = await getAccessToken(supabase);
  if (!accessToken) return { sessions: null, tableMissing: false };

  try {
    const response = await fetch("/api/login-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        deviceKey,
        label: device.label,
        deviceType: device.deviceType,
        browser: device.browser,
        os: device.os,
      }),
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      sessions?: LoginSession[];
      tableMissing?: boolean;
      error?: string;
    };

    if (response.status === 401) return { sessions: null, tableMissing: false };
    if (payload.tableMissing) return { sessions: null, tableMissing: true };
    if (!response.ok || !payload.sessions) {
      console.warn("Login-session API fejlede:", payload.error ?? response.statusText);
      return { sessions: null, tableMissing: false };
    }

    return { sessions: payload.sessions, tableMissing: false };
  } catch (error) {
    console.warn("Login-session API utilgængelig:", error);
    return { sessions: null, tableMissing: false };
  }
}

async function loadLoginSessionsViaApi(
  supabase: SupabaseClient,
  deviceKey: string
): Promise<{ sessions: LoginSession[] | null; tableMissing: boolean }> {
  const accessToken = await getAccessToken(supabase);
  if (!accessToken) return { sessions: null, tableMissing: false };

  try {
    const response = await fetch(
      `/api/login-sessions?deviceKey=${encodeURIComponent(deviceKey)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const payload = (await response.json()) as {
      sessions?: LoginSession[];
      tableMissing?: boolean;
      error?: string;
    };

    if (response.status === 401) return { sessions: null, tableMissing: false };
    if (payload.tableMissing) return { sessions: null, tableMissing: true };
    if (!response.ok || !payload.sessions) {
      console.warn("Kunne ikke hente login-sessioner:", payload.error ?? response.statusText);
      return { sessions: null, tableMissing: false };
    }

    return { sessions: payload.sessions, tableMissing: false };
  } catch (error) {
    console.warn("Login-session API utilgængelig:", error);
    return { sessions: null, tableMissing: false };
  }
}

async function fetchLoginSessionsFromDb(
  supabase: SupabaseClient,
  userId: string,
  currentDeviceKey: string
): Promise<{ sessions: LoginSession[]; available: boolean }> {
  const { data, error } = await supabase
    .from(LOGIN_SESSIONS_TABLE)
    .select("id, device_key, label, device_type, browser, os, last_active_at")
    .eq("user_id", userId)
    .order("last_active_at", { ascending: false })
    .limit(MAX_LOGIN_SESSIONS);

  if (error) {
    if (isMissingTableError(error.message)) {
      return { sessions: [], available: false };
    }
    console.warn("Kunne ikke hente login-sessioner fra database:", error.message);
    return { sessions: [], available: false };
  }

  return {
    sessions: (data ?? []).map((row) =>
      rowToLoginSession(row as LoginSessionRow, currentDeviceKey)
    ),
    available: true,
  };
}

async function upsertLoginSessionToDb(
  supabase: SupabaseClient,
  userId: string,
  deviceKey: string,
  device: ReturnType<typeof getDeviceInfo>,
  now: string
): Promise<boolean> {
  const { error } = await supabase.from(LOGIN_SESSIONS_TABLE).upsert(
    {
      user_id: userId,
      device_key: deviceKey,
      label: device.label,
      device_type: device.deviceType,
      browser: device.browser,
      os: device.os,
      last_active_at: now,
    },
    { onConflict: "user_id,device_key" }
  );

  if (error) {
    if (isMissingTableError(error.message)) return false;
    console.warn("Kunne ikke gemme login-session:", error.message);
    return false;
  }

  return true;
}

async function migrateMetadataSessionsToDb(
  supabase: SupabaseClient,
  userId: string,
  sessions: LoginSession[]
) {
  if (!sessions.length) return;

  const rows = sessions.map((session) => ({
    user_id: userId,
    device_key: session.id,
    label: session.label,
    device_type: session.deviceType,
    browser: session.browser,
    os: session.os,
    last_active_at: session.lastActiveAt,
  }));

  await supabase.from(LOGIN_SESSIONS_TABLE).upsert(rows, { onConflict: "user_id,device_key" });
}

export async function loadLoginSessions(supabase: SupabaseClient): Promise<LoginSession[]> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return [];

  const deviceKey = buildSessionId();
  const settings = parseSecuritySettings(
    user.user_metadata?.security_settings,
    user.user_metadata
  );

  const apiResult = await loadLoginSessionsViaApi(supabase, deviceKey);
  if (apiResult.sessions !== null) {
    return apiResult.sessions;
  }

  const { sessions, available } = await fetchLoginSessionsFromDb(
    supabase,
    user.id,
    deviceKey
  );

  if (available && sessions.length) {
    return sessions;
  }

  if (available && !sessions.length && settings.loginSessions.length) {
    await migrateMetadataSessionsToDb(supabase, user.id, settings.loginSessions);
    const migrated = await fetchLoginSessionsFromDb(supabase, user.id, deviceKey);
    if (migrated.sessions.length) {
      return migrated.sessions;
    }
  }

  if (available && sessions.length === 0) {
    return sessions;
  }

  const current = buildLocalLoginSession(deviceKey, getDeviceInfo(), new Date().toISOString());
  return settings.loginSessions.length
    ? settings.loginSessions.map((session) => ({
        ...session,
        isCurrent: session.id === deviceKey,
      }))
    : [current];
}

export async function loadSecuritySettings(
  supabase: SupabaseClient
): Promise<{ settings: SecuritySettings; email: string | null; lastSignIn: string | null }> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return { settings: DEFAULT_SETTINGS, email: null, lastSignIn: null };
  }

  const settings = parseSecuritySettings(
    user.user_metadata?.security_settings,
    user.user_metadata
  );
  const loginSessions = await loadLoginSessions(supabase);
  const mfaVerified = await getMfaEnabled(supabase);
  const twoFactorEnabled = settings.twoFactorEnabled || mfaVerified;

  return {
    settings: { ...settings, loginSessions, twoFactorEnabled },
    email: user.email ?? null,
    lastSignIn: user.last_sign_in_at ?? null,
  };
}

export async function repairTwoFactorMetadata(
  supabase: SupabaseClient,
  settings: SecuritySettings
): Promise<void> {
  const mfaVerified = await getMfaEnabled(supabase);
  if (!mfaVerified || settings.twoFactorEnabled) return;

  await persistSecuritySettings(
    supabase,
    { ...settings, twoFactorEnabled: true },
    { allowTwoFactorDisable: false }
  );
}

type PersistSecurityOptions = {
  /** Opdater kun loginSessions — rør ikke 2FA, blokeringer osv. */
  sessionsOnly?: boolean;
  /** Tillad eksplicit deaktivering af to-faktor (sluk-knap). */
  allowTwoFactorDisable?: boolean;
};

async function persistSecuritySettings(
  supabase: SupabaseClient,
  settings: SecuritySettings,
  options: PersistSecurityOptions = {}
): Promise<{ error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { error: "Ikke logget ind." };

  const existing = parseSecuritySettings(
    user.user_metadata?.security_settings,
    user.user_metadata
  );

  let next: SecuritySettings;

  if (options.sessionsOnly) {
    next = {
      ...existing,
      loginSessions: settings.loginSessions,
    };
  } else {
    next = {
      ...existing,
      ...settings,
      loginSessions:
        settings.loginSessions.length > 0 ? settings.loginSessions : existing.loginSessions,
    };
  }

  const mfaVerified = await getMfaEnabled(supabase);
  if (options.allowTwoFactorDisable) {
    next.twoFactorEnabled = settings.twoFactorEnabled;
  } else {
    next.twoFactorEnabled =
      next.twoFactorEnabled || existing.twoFactorEnabled || mfaVerified;
  }

  const { data, error } = await supabase.auth.updateUser({
    data: {
      security_settings: next,
      two_factor_enabled: next.twoFactorEnabled,
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Kunne ikke opdatere kontoindstillinger." };
  return { error: null };
}

export type MfaEnrollData = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

function normalizeQrCodeSrc(qrCode: string): string {
  if (qrCode.startsWith("data:")) return qrCode;
  if (qrCode.trim().startsWith("<svg")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`;
  }
  return qrCode;
}

export async function startMfaEnroll(
  supabase: SupabaseClient
): Promise<{ data: MfaEnrollData | null; error: string | null }> {
  const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) return { data: null, error: listError.message };

  for (const factor of existingFactors?.all ?? []) {
    if (factor.status !== "verified") {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "SecondSwing",
  });

  if (error) return { data: null, error: error.message };
  if (!data?.totp) return { data: null, error: "Kunne ikke starte to-faktor opsætning." };

  return {
    data: {
      factorId: data.id,
      qrCode: normalizeQrCodeSrc(data.totp.qr_code),
      secret: data.totp.secret,
      uri: data.totp.uri ?? "",
    },
    error: null,
  };
}

export async function verifyMfaEnroll(
  supabase: SupabaseClient,
  factorId: string,
  code: string
): Promise<{ error: string | null }> {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeError) return { error: challengeError.message };

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });

  return { error: verifyError?.message ?? null };
}

export async function disableAllMfa(supabase: SupabaseClient): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return { error: error.message };

  for (const factor of data?.totp ?? []) {
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (unenrollError) return { error: unenrollError.message };
  }

  return { error: null };
}

export async function syncCurrentLoginSession(
  supabase: SupabaseClient
): Promise<SecuritySettings> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return DEFAULT_SETTINGS;

  const settings = parseSecuritySettings(
    user.user_metadata?.security_settings,
    user.user_metadata
  );
  const deviceKey = buildSessionId();
  const device = getDeviceInfo();
  const now = new Date().toISOString();

  let loginSessions: LoginSession[];

  const apiResult = await syncLoginSessionsViaApi(supabase, deviceKey, device);
  if (apiResult.sessions !== null) {
    loginSessions = apiResult.sessions;
  } else {
    const storedInDb = await upsertLoginSessionToDb(
      supabase,
      user.id,
      deviceKey,
      device,
      now
    );

    if (storedInDb) {
      if (settings.loginSessions.length) {
        await migrateMetadataSessionsToDb(supabase, user.id, settings.loginSessions);
      }
      const fetched = await fetchLoginSessionsFromDb(supabase, user.id, deviceKey);
      loginSessions = fetched.sessions.length
        ? fetched.sessions
        : [buildLocalLoginSession(deviceKey, device, now)];
    } else {
      loginSessions = [buildLocalLoginSession(deviceKey, device, now)];
    }
  }

  return { ...settings, loginSessions };
}

export async function saveTwoFactorEnabled(
  supabase: SupabaseClient,
  enabled: boolean,
  current: SecuritySettings
): Promise<{ settings: SecuritySettings; error: string | null }> {
  const next = { ...current, twoFactorEnabled: enabled };
  const { error } = await persistSecuritySettings(supabase, next, {
    allowTwoFactorDisable: !enabled,
  });
  return { settings: next, error };
}

export async function blockUser(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
  current: SecuritySettings
): Promise<{ settings: SecuritySettings; error: string | null }> {
  if (current.blockedUsers.some((user) => user.id === userId)) {
    return { settings: current, error: null };
  }

  const next = {
    ...current,
    blockedUsers: [
      { id: userId, displayName, blockedAt: new Date().toISOString() },
      ...current.blockedUsers,
    ],
  };
  const { error } = await persistSecuritySettings(supabase, next);
  return { settings: next, error };
}

export async function unblockUser(
  supabase: SupabaseClient,
  userId: string,
  current: SecuritySettings
): Promise<{ settings: SecuritySettings; error: string | null }> {
  const next = {
    ...current,
    blockedUsers: current.blockedUsers.filter((user) => user.id !== userId),
  };
  const { error } = await persistSecuritySettings(supabase, next);
  return { settings: next, error };
}

export async function submitUserReport(
  supabase: SupabaseClient,
  report: Omit<UserReport, "id" | "createdAt">,
  current: SecuritySettings
): Promise<{ settings: SecuritySettings; error: string | null }> {
  const next = {
    ...current,
    reports: [
      {
        id: crypto.randomUUID(),
        ...report,
        createdAt: new Date().toISOString(),
      },
      ...current.reports,
    ].slice(0, 20),
  };
  const { error } = await persistSecuritySettings(supabase, next);
  return { settings: next, error };
}

export async function searchProfiles(
  query: string,
  excludeUserId?: string
): Promise<{ id: string; display_name: string | null }[]> {
  const profiles = await searchProfilesApi(query, excludeUserId);
  return profiles.map((profile) => ({
    id: profile.id,
    display_name: profile.display_name,
  }));
}

export async function getMfaEnabled(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return false;
  return data.totp.some((factor) => factor.status === "verified");
}
