import { getProfilesByIds } from "@/server/profiles";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string") : [];

    if (!ids.length) {
      return NextResponse.json([]);
    }

    const profiles = await getProfilesByIds(ids);
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("POST /api/profiles/batch fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke hente profiler" }, { status: 500 });
  }
}
