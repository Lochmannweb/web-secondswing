import { searchProfiles } from "@/server/profiles";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") ?? "";
    const exclude = req.nextUrl.searchParams.get("exclude") ?? undefined;
    const profiles = await searchProfiles(query, exclude);
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("GET /api/profiles/search fejlede:", error);
    return NextResponse.json({ error: "Kunne ikke søge profiler" }, { status: 500 });
  }
}
