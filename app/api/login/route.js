// // app/api/login/route.js   ← same path as Django!
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const body = await request.json();

//     const backendResponse = await fetch("https://panel-1-tlqv.onrender.com/api/login/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         // Forward any existing cookies (useful for logout → login)
//         ...(request.headers.get("cookie") && {
//           cookie: request.headers.get("cookie"),
//         }),
//       },
//       body: JSON.stringify(body),
//       credentials: "include",
//     });

//     const data = await backendResponse.json();

//     const response = NextResponse.json(data, { status: backendResponse.status });

//     // This forwards the Set-Cookie headers so cookies are set on YOUR domain
//     const setCookies = backendResponse.headers.getSetCookie();
//     setCookies.forEach((cookie) => {
//       response.headers.append("set-cookie", cookie);
//     // });

//     return response;
//   } catch (error) {
//     return NextResponse.json({ detail: "Login failed" }, { status: 500 });
//   }
// }

// // Important: This makes Next.js treat this as a real route, not a rewrite
// export const dynamic = "force-dynamic";