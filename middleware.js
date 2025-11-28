// middleware.js
import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/publications/create",
  "/our-services",
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

  // Skip Vercel build
  if (process.env.VERCEL === "1" && !request.headers.get("user-agent")) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  try {
    // This is SAME-SITE → cookies are always sent
    const sessionUrl = new URL("/api/auth/session", request.url);
    const res = await fetch(sessionUrl.toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!res.ok || !(await res.json()).valid) {
      throw new Error("Unauthorized");
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "1");
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/publications/create/:path*",
    "/our-services/:path*",
    "/guidelines/(author|editors|reviewers)/:path*",
    "/publications/list/:path*",
    "/PaymentDetails/:path*",
    "/PaymentModel/:path*",
    "/NotificationList/:path*",
    "/SubscriptionGate/:path*",
    "/payment/history/:path*",
    "/authorspage/:path*",
    "/conference/(past|upcoming)/:path*",
  ],
};