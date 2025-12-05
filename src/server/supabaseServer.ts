import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // 1. Await the cookies() promise (Required for Next.js 15)
  const cookieStore = await cookies();

  // 1. Read variables securely
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. Add a clear check before initializing
  if (!supabaseUrl || !supabaseKey) {
    // During build time (static generation), these might be missing. 
    // We can log a warning or throw a clearer error.
    console.error("❌ Supabase Keys missing! Check your .env file.");
    
    // Throwing here stops the build with a clear message
    throw new Error("Missing Supabase URL or Key in .env file");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore for Server Components
          }
        },
      },
    }
  );
}