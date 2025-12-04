// app/api/me/route.js ← FINAL 100% WORKING VERSION

export const GET = async (request) => {
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");

  if (!backendUrl) {
    return new Response("Backend URL missing", { status: 500 });
  }

  const cookieHeader = request.headers.get("cookie");

  try {
    const response = await fetch(`${backendUrl}/me/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Cookie": cookieHeader || "",           // ← THIS LINE WAS WRONG BEFORE
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("JSON parse failed:", text);
    }

    if (response.ok) {
      return new Response(JSON.stringify({ user: data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Django /me/ failed:", response.status, data);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  } catch (error) {
    console.error("Proxy /me/ error:", error);
    return new Response("Server error", { status: 500 });
  }
};