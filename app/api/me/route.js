// app/api/me/route.js   ← Pure JavaScript (no TypeScript)

export async function GET(request) {
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "Backend URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(`${backendUrl}/me/`, {
      method: "GET",
      credentials: "include", // This sends cookies (access_token, refresh_token)
      headers: {
        // Forward any cookies the browser sent to Next.js
        Cookie: request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ user: data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Proxy /api/me error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}