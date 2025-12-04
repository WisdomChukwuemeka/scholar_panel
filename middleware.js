// middleware.js   ← pure JavaScript, works 100%
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

const AUTH_PAGES = ["/login", "/register"];

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Debug log (keep while testing, remove later if you want)
  console.log("Middleware → path:", pathname);
  console.log("Cookies seen:", request.cookies.get("access_token") ? "access_token YES" : "NO");
  console.log("Cookies seen:", request.cookies.get("refresh_token") ? "refresh_token YES" : "NO");

  const hasAccessToken = request.cookies.has("access_token");
  const hasRefreshToken = request.cookies.has("refresh_token");
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  const needsAuth = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  const isOnAuthPage = AUTH_PAGES.includes(pathname);

  // Not logged in → trying to access protected page
  if (needsAuth && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → trying to go to login/register
  if (isAuthenticated && isOnAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/publications/:path*",
    "/tasks/:path*",
    "/guidelines/:path*",
    "/contact/:path*",
    "/conference/:path*",
  ],
};