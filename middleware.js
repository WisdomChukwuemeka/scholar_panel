import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const PROTECTED_ROUTES = ["/dashboard", "/tasks", "/contact", "/payment", "/NotificationList", "/our-services", "/publications", "/about"];

export function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((route) =>
    path.startsWith(route)
  );

  // Read Django cookie
  const access = cookies().get("access_token")?.value;

  // Not logged in → redirect to login
  if (isProtected && !access) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Middleware should not run on API, static files, images
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
