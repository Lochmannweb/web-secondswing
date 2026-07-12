import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/notifications";
import type { NotificationPreferences } from "@/app/lib/notifications";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/app/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    const preferencesRaw = req.nextUrl.searchParams.get("preferences");
    let preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;

    if (preferencesRaw) {
      try {
        preferences = JSON.parse(preferencesRaw) as NotificationPreferences;
      } catch {
        preferences = DEFAULT_NOTIFICATION_PREFERENCES;
      }
    }

    const notifications = await listNotifications(userId, preferences);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/notifications fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente notifikationer" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      user_id?: string;
      action?: "read" | "read_all";
      notification?: {
        id: string;
        source: "table" | "message";
        metadata?: Record<string, unknown>;
      };
      notifications?: Array<{
        id: string;
        source: "table" | "message";
        read_at: string | null;
        metadata?: Record<string, unknown>;
      }>;
    };

    const userId = body.user_id;
    if (!userId) {
      return NextResponse.json({ error: "user_id mangler" }, { status: 400 });
    }

    if (body.action === "read_all" && body.notifications) {
      await markAllNotificationsRead(userId, body.notifications);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "read" && body.notification) {
      await markNotificationRead(userId, body.notification);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ugyldig handling" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/notifications fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke opdatere notifikationer" }, { status: 500 });
  }
}
