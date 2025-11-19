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
  "/payments/history",
];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (!PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const res = await fetch("http://localhost:8000/api/me/", {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (!res.ok) {
      throw new Error("Not authenticated");
    }

    const data = await res.json();

    if (!data || !data.role || data.role === "") {
      throw new Error("Not authenticated");
    }

    return NextResponse.next();
  } catch (error) {
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
    "/payments/history/:path*",
  ],
};
