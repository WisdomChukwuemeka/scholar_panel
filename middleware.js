// middleware.js — FINAL, CLEAN, BULLETPROOF VERSION (Copy & Paste)

import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/publications/create",
  "/resources",
  "/our-services",
  "/about",
  "/contact",
  "/guidelines/author",
  "/guidelines/editors",
  "/guidelines/reviewers",
  "/publications/list",
  "/PaymentDetails",
  "/PaymentModel",
  "/NotificationList",
  "/SubscriptionGate",
  "/payment/history",
  "/authorspage",
  "/conference/past",
  "/conference/upcoming",
];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Skip during Vercel build
  if (
    process.env.VERCEL === "1" &&
    process.env.NODE_ENV === "production" &&
    !request.headers.get("x-vercel-deployment-url") &&
    !request.headers.get("user-agent")
  ) {
    return NextResponse.next();
  }

  // Only run on protected routes
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  try {
    const response = await fetch(new URL("/api/me/", request.url), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    // 401 → access or refresh token expired → force login
    if (response.status === 401) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!response.ok) throw new Error("Auth failed");

    const user = await response.json();
    if (!user?.role) throw new Error("No role in response");

    // All good → go to protected page
    return NextResponse.next();
  } catch (error) {
    // Any error → send to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/publications/create/:path*",
    "/resources/:path*",
    "/our-services/:path*",
    "/about/:path*",
    "/contact/:path*",
    "/guidelines/author/:path*",
    "/guidelines/editors/:path*",
    "/guidelines/reviewers/:path*",
    "/publications/list/:path*",
    "/PaymentDetails/:path*",
    "/PaymentModel/:path*",
    "/NotificationList/:path*",
    "/SubscriptionGate/:path*",
    "/payment/history/:path*",
    "/authorspage/:path*",
    "/conference/past/:path*",
    "/conference/upcoming/:path*",
  ],
};