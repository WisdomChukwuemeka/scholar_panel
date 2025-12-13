// // app/api/logout/route.js
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   const backendResponse = await fetch("https://panel-1-tlqv.onrender.com/api/logout/", {
//     method: "POST",
//     headers: {
//       ...(request.headers.get("cookie") && { cookie: request.headers.get("cookie") }),
//     },
//     credentials: "include",
//   });

//   const response = NextResponse.json({ message: "Logged out" }, { status: 200 });

//   // Forward cookie clearing
//   backendResponse.headers.getSetCookie().forEach((cookie) => {
//     response.headers.append("set-cookie", cookie);
//   });

//   // Extra safety
//   response.cookies.delete("access_token");
//   response.cookies.delete("refresh_token");

//   return response;
// }

// export const dynamic = "force-dynamic";