// app/api/auth/session/route.js
import { NextResponse } from "next/server";

const BACKEND = "https://panel-1-tlqv.onrender.com";

export async function GET(request) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // No tokens at all → not logged in
  if (!accessToken && !refreshToken) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // Try access token first
  if (accessToken) {
    try {
      const res = await fetch(`${BACKEND}/api/me/`, {
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const user = await res.json();
        return NextResponse.json({ valid: true, user });
      }
    } catch (e) {
      console.log("Access token expired or invalid");
    }
  }

  // Try to refresh using refresh_token
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${BACKEND}/api/token/refresh/`, {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
          "Content-Type": "application/json",
        },
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccessToken = data.access || data.access_token;

        if (newAccessToken) {
          const response = NextResponse.json({ valid: true, refreshed: true });
          response.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
          });

          // Re-check /me/ with new token
          const meRes = await fetch(`${BACKEND}/api/me/`, {
            headers: { Cookie: `access_token=${newAccessToken}` },
          });

          if (meRes.ok) {
            const user = await meRes.json();
            return NextResponse.json({ valid: true, user });
          }
        }
      }
    } catch (e) {
      console.log("Refresh failed");
    }
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}