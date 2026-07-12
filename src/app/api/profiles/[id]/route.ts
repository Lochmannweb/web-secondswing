import { getProfileById, upsertProfile } from "@/server/profiles";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const profile = await getProfileById(id);

    if (!profile) {
      return NextResponse.json({ error: "Profil ikke fundet" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/profiles/[id] fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente profil" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      display_name?: string;
      avatar_url?: string | null;
    };

    const profile = await upsertProfile(id, {
      display_name: typeof body.display_name === "string" ? body.display_name : undefined,
      avatar_url:
        typeof body.avatar_url === "string" || body.avatar_url === null
          ? body.avatar_url
          : undefined,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("PATCH /api/profiles/[id] fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke opdatere profil" }, { status: 500 });
  }
}
