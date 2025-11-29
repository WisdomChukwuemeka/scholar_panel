export const config = {
  api: {
    bodyParser: false,
  },
};

const BACKEND_URL = "https://panel-1-tlqv.onrender.com/api";

export async function GET(req, { params }) {
  return proxyRequest(req, params);
}

export async function POST(req, { params }) {
  return proxyRequest(req, params);
}

export async function PUT(req, { params }) {
  return proxyRequest(req, params);
}

export async function PATCH(req, { params }) {
  return proxyRequest(req, params);
}

export async function DELETE(req, { params }) {
  return proxyRequest(req, params);
}

async function proxyRequest(req, params) {
  try {
    const endpointArray = params.endpoint || [];
    const query = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";

    const targetURL = `${BACKEND_URL}/${endpointArray.join("/")}${query}`;

    const headers = { ...Object.fromEntries(req.headers) };
    delete headers.host;

    // Stream body if not GET
    const body =
      req.method === "GET" ? undefined : Buffer.from(await req.arrayBuffer());

    const response = await fetch(targetURL, {
      method: req.method,
      headers,
      body,
    });

    const resHeaders = {};
    response.headers.forEach((value, key) => {
      resHeaders[key] = value;
    });

    return new Response(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    return new Response(
      JSON.stringify({ error: "Proxy request failed" }),
      { status: 500 }
    );
  }
}
