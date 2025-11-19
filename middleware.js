// proxy.js (place this file in your project root, next to package.json or inside /src at the same level as /app)
import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/publications/create",
  "/resources", // Include if /resources needs protection
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
  // console.log(`Proxy triggered for path: ${pathname}`); // Log to confirm execution
  // console.log(`Cookies in request: ${request.headers.get("cookie") || "none"}`); // Log cookies

  // Skip if not protected
  if (!PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    // console.log(`Path ${pathname} is not protected - proceeding`);
    return NextResponse.next();
  }

  try {
    // console.log(`Fetching /api/me/ for auth check`);
    const res = await fetch("http://localhost:8000/api/me/", {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    // console.log(`Fetch status: ${res.status}`); // Log status

    if (!res.ok) {
      // console.log(`Not authenticated (status ${res.status}) - redirecting`);
      throw new Error("Not authenticated");
    }

    const data = await res.json();
    // console.log(`Fetch data: ${JSON.stringify(data)}`); // Log response data

    // Validate: Adjust based on your API's unauth response (e.g., !data.id, data.authenticated === false)
    if (!data || !data.role || data.role === "") {
      // console.log(`Invalid data (no role) - redirecting`);
      throw new Error("Not authenticated");
    }

    // console.log(`Authenticated - proceeding`);
    return NextResponse.next();
  } catch (error) {
    // console.error(`Error in proxy: ${error.message}`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: PROTECTED_PATHS.map(path => `${path}/:path*`),
};