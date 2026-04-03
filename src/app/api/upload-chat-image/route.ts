import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "Ingen fil valgt" }, { status: 400 });
    }

    if (!fileName) {
      return NextResponse.json({ error: "Ingen filnavn" }, { status: 400 });
    }

    // Use service role key for admin access (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABEBASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration fejl: mangler admin API key" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage with service role
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload fejl: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName);

    console.log("File uploaded successfully:", fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl.publicUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload fejl";
    console.error("API upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
