import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.Cookies.get("access_token"); // Django HttpOnly cookie

  // List all protected paths
  const protectedPaths = [
    "/dashboard",
    "/publication/list",
    "/messages",
    "/publications/create",
    "/notifications",
    "/tasks",
  ];

  // Check if current path starts with any protected path
  const path = req.nextUrl.pathname;
  const requiresAuth = protectedPaths.some((p) => path.startsWith(p));

  if (requiresAuth && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/publication/list/:path*",
    "/messages/:path*",
    "/publications/create/:path*",
    "/notifications/:path*",
    "/tasks/:path*",
  ],
};
