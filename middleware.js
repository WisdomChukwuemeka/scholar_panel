// middleware.js — FINAL CLEAN & PERFECT VERSION (NO /me NEEDED)

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

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!isProtected && !isAuthPage) return NextResponse.next();

  // Use a real protected endpoint to test auth
  const testUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/publications/`;

  try {
    const res = await fetch(testUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: request.headers.get("cookie") || "",
        Accept: "application/json",
      },
    });

    const isAuthenticated = res.ok;

    if (isProtected && !isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthPage && isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    if (isProtected) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};