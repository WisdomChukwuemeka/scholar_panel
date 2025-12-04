// app/api/me/route.js  ← FINAL WORKING VERSION

export const GET = async (request) => {
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!backendUrl) {
    return new Response("Backend URL missing", { status: 500 });
  }

  // Get the incoming cookie header
  const cookieHeader = request.headers.get("cookie");

  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/me/`, {
      method: "GET",
      credentials: "include", // Critical
      headers: {
        // This is the magic line that actually works on Vercel
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "Content-Type": "application/json",
      },
    });

    const text = await response.text(); // Get raw text first

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      data = {};
    }

    if (response.ok) {
      return new Response(JSON.stringify({ user: data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Log exactly what Django returned
      console.log("Django /me/ returned:", response.status, data);
      return new Response(JSON.stringify({ error: "Unauthorized", details: data }), {
        status: 401,
      });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Server error", { status: 500 });
  }
};

// Important: Allow cookies to be sent
export const config = {
  api: {
    bodyParser: false,
  },
};