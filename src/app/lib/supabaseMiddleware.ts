import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Set cookies on the request (so the server sees them now)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value) // ændrer kun serverens view
          );
          
          // 2. Set cookies on the response (so the browser sees them later)
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options) // sender dem til browseren
          );
        },
      },
    }
  );

  // This refreshes the auth token if it's expired
  // Loader supabase-session fra cookies (HTTP-only)
  // Hvis access-token er udløbet, henter Supabase automatisk en ny JWT + ny refresh token
  // Sætter de nye cookies på både: request(så serverkoden har adgang samme request) og response(så browseren får opdaterede tokens)
  await supabase.auth.getUser();
  return supabaseResponse;
}