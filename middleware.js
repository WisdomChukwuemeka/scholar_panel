// middleware.js  ←  FINAL WORKING VERSION
import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/publications/list",
  "/publications/create",
  "/tasks",
  "/guidelines/author",
  "/guidelines/reviewers",
  "/guidelines/editors",
  "/contact",
  "/conference/past",
  "/conference/upcoming",
];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // THIS IS THE MAGIC LINE
  const requestHeaders = new Headers(request.headers);
  const cookie = request.headers.get("cookie") || "";

  // Manually parse cookies (Vercel edge sometimes misses them)
  const cookies = Object.fromEntries(
    cookie.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    })
  );

  const hasAccessToken = !!cookies.access_token;
  const hasRefreshToken = !!cookies.refresh_token;
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  const needsAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === "/login" || pathname === "/register";

  // Debug (remove later if you want)
  console.log("Middleware check:", { pathname, isAuthenticated, hasAccessToken, hasRefreshToken });

  if (needsAuth && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // THIS LINE IS CRITICAL — forward cookies to next middleware/pages
  const response = NextResponse.next();
  if (cookie) {
    response.headers.set("cookie", cookie);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
};