// middleware.js   ← Pure JavaScript

import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/publications",
  "/tasks",
  "/guidelines",
  "/contact",
  "/conference",
];

const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Skip middleware for static files, API routes, etc.
  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  // Call your own proxy endpoint to check auth
  const meUrl = new URL("/api/me", request.url);
  const meResponse = await fetch(meUrl, {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const isAuthenticated = meResponse.ok;

  // Protected route → not logged in
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → trying to access login/register
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // All good
  return NextResponse.next();
}

// Apply to all routes except API, _next, static files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};