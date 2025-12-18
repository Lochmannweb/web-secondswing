import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./app/lib/supabaseMiddleware";

export function middleware(request: NextRequest) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const csrfCookie = request.cookies.get("csrf-token")?.value;
    console.log("CSRF Cookie:", csrfCookie);

    const csrfHeader = request.headers.get("x-csrf-token");
    console.log("CSRF Cookie:", csrfHeader);


    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return new NextResponse("Forbidden – CSRF", { status: 403 });
    }
  }

  return NextResponse.next();
}

// export async function middleware(request: NextRequest) {
//   // ----- CSRF VALIDERING (Origin/Referer) -----
//   const method = request.method;

//   // Beskytter state-changerende requests (GET - må ikke ændre data)
//   if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {

//     // Tjekker hvor requesten kommer fra
//     const origin = request.headers.get("origin");
//     console.log("Origin: ", origin);

//     const referer = request.headers.get("referer");
//     console.log("Referer: ", referer);
    

//     // Kun eget domæne er tilladt
//     const allowed = process.env.NEXT_PUBLIC_BASE_URL;

//     // hvis environment variabel mangler → skip CSRF-check
//     if (!allowed) {
//       console.error("CSRF: NEXT_PUBLIC_BASE_URL mangler");
//       return NextResponse.json(
//         { error: "Server configuration error" },
//         { status: 500 }
//       );
//     }

//     // Requuesten er kun gyldig hvis enten origin eller referer matcher vores domæne
//     const validOrigin = origin === allowed;
//     const validReferer = referer?.startsWith(allowed) ?? false; // bliver automatisk kaldt hver gang typerne POST, PUT, PATCH, DELETE rammer serveren 

//     // Hvis requesten kommer fra et andet website - blokér den
//     if (!validOrigin && !validReferer) {
//       return new NextResponse("Forbidden – CSRF Blocked", { status: 403 });
//     }
//   }


//   // kør supabase middelware (refresh, cookies, session)
//   const response = await updateSession(request);
//   return response;
// }


export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};