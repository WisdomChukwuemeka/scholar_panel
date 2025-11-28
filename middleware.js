// middleware.js
import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/publications/create",
  // "/resources",
  "/our-services",
  // "/about",
  // "/contact",
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

// CORRECT URL – no double /api
// const BACKEND = "https://panel-1-tlqv.onrender.com";


export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const isVercelBuild =
    process.env.VERCEL === "1" &&
    process.env.NODE_ENV === "production" &&
    !request.headers.get("x-vercel-deployment-url") &&
    !request.headers.get("user-agent");

  if (isVercelBuild) return NextResponse.next();

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  try {
    // ✅ Use relative URL to leverage Next.js rewrite
    const baseUrl = new URL(request.url).origin;
    const response = await fetch(`${baseUrl}/api/me/`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: request.cookies.toString(),
        "Content-Type": "application/json",
      },
    });

    console.log("Auth check status:", response.status); // Debug

    if (response.status === 401) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!response.ok) throw new Error("Unauthorized");

    const user = await response.json();
    if (!user?.role) throw new Error("No role");

    return NextResponse.next();
  } catch (error) {
    console.error("Auth failed:", error.message);
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
    // "/resources/:path*",
    "/our-services/:path*",
    // "/about/:path*",
    // "/contact/:path*",
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