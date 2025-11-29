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

const BACKEND = "https://panel-1-tlqv.onrender.com";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // ✅ CRITICAL: Skip middleware for these routes (expanded list)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/") ||  // This should catch all API routes
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    console.log(`[Middleware] Skipping excluded route: ${pathname}`);
    return NextResponse.next();
  }

  // Skip during Vercel build
  const isVercelBuild =
    process.env.VERCEL === "1" &&
    process.env.NODE_ENV === "production" &&
    !request.headers.get("x-vercel-deployment-url");

  if (isVercelBuild) {
    console.log("[Middleware] Skipping Vercel build");
    return NextResponse.next();
  }

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  
  if (!isProtected) {
    console.log(`[Middleware] Not protected: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`[Middleware] Checking auth for protected path: ${pathname}`);

  try {
    // Get cookies from request
    const cookieHeader = request.headers.get("cookie") || "";
    console.log(`[Middleware] Cookies present: ${!!cookieHeader}`);

    const response = await fetch(`${BACKEND}/api/me/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Cookie": cookieHeader,
        "Content-Type": "application/json",
      },
    });

    console.log(`[Middleware] /api/me/ status: ${response.status}`);

    if (response.status === 401) {
      console.log("[Middleware] Unauthorized - redirecting to login");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!response.ok) {
      throw new Error(`Auth check failed with status: ${response.status}`);
    }

    const user = await response.json();
    
    if (!user?.role) {
      throw new Error("No role in user response");
    }

    console.log(`[Middleware] Auth success for: ${user.email} (${user.role})`);
    return NextResponse.next();

  } catch (error) {
    console.error("[Middleware] Auth error:", error.message);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
   matcher: [
    '/((?!api|_next|static|.*\\..*|favicon.ico|login|register).*)',
  ],

};
