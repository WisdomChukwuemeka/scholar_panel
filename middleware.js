// import { NextResponse } from "next/server";

// export function middleware(req) {
//   // Correct cookie access
//   const access = req.cookies.get("access_token")?.value;
//   const refresh = req.cookies.get("refresh_token")?.value;

//   const isAuthenticated = !!access || !!refresh;

//   const path = req.nextUrl.pathname;

//   // Protected pages
//   const protectedPaths = [
//     "/guidelines/author",
//     "/guidelines/reviewers",
//     "/guidelines/editors",
//     "/dashboard",
//     "/publications/list",
//     "/publications/create",
//     "/tasks",
//     "/contact",
//     "/conference/past",
//     "/conference/upcoming",
//   ];

//   const requiresAuth = protectedPaths.some((p) => path.startsWith(p));

//   // Redirect unauthenticated users trying to access protected pages
//   if (requiresAuth && !isAuthenticated) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // Redirect authenticated users away from login/register
//   const authPages = ["/login", "/register"];
//   const isAuthPage = authPages.includes(path);

//   if (isAuthenticated && isAuthPage) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/publications/:path*",  // covers /publication and /publication/list
//     "/tasks/:path*",
//     "/guidelines/:path*",
//     "/contact/:path*",
//     "/conference/:path*",
//   ],
// };

