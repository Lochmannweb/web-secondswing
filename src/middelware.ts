import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./app/lib/supabaseMiddleware";

export async function middleware(request: NextRequest) {
  // ----- CSRF VALIDERING (Origin/Referer) -----
  const method = request.method;

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    const allowed = process.env.NEXT_PUBLIC_BASE_URL;

    // hvis environment variabel mangler → skip CSRF-check
    if (!allowed) {
      console.warn("CSRF: NEXT_PUBLIC_BASE_URL mangler");
      return NextResponse.json(
        { error: "Server config error (missing NEXT_PUBLIC_BASE_URL)" },
        { status: 500 }
      );
    }

    const validOrigin = origin === allowed;
    const validReferer = referer?.startsWith(allowed) ?? false; // bliver automatisk kaldt hver gang typerne POST, PUT, PATCH, DELETE rammer serveren 

    if (!validOrigin && !validReferer) {
      return new NextResponse("Forbidden – CSRF Blocked", { status: 403 });
    }
  }



  // kør supabase middelware (refresh, cookies, session)
  const response = await updateSession(request);

  // tilføj sikkerhedsheaders (CSP)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri, 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",

      // Next script og hydration
      "style-src 'self' 'unsafe-inline' 'unsafe-eval' blob: 'wasm-unsafe-eval'",

      // Supabase API's + Google OAuth redirect
      "connect-src 'self' https://*.supabase.co hhts://accounts.google.com https://oauth2.googleapis.com",

      // Next Image + Supabase storage 
      "img-src 'self'  blob: data: https://*.supabase.co",

      // Inline styles tilladt 
      "style-src 'self' 'unsafe-inline'",

      // Fonts må gerne komme os selv
      "font-src 'self'",

      // Tillad Google 0Auth redirect
      "frame-src https://accounts.google.com",
      "child-src https://accounts.google.com"
    ].join("; ")
  );


  // sikkerhes headers
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "Camera=(), microphone=(), geolocation=()");

  return response;
}


export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};