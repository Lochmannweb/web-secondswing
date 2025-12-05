import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // 1. Read the variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. Check if they exist
  if (!supabaseUrl || !supabaseKey) {
    console.error("---------------------------------------------------");
    console.error("⚠️  ERROR: Supabase Keys are missing.");
    console.error("   Please ensure you have a .env file in the ROOT folder.");
    console.error("   Current Directory:", process.cwd());
    console.error("---------------------------------------------------");
    
    // Prevent the build from crashing with a confusing library error
    throw new Error("Missing Supabase Keys"); 
  }

  // 3. Create the client safely
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
            // Ignore writes in Server Components
          }
        },
      },
    }
  );
}