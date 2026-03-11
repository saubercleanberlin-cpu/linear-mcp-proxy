export interface Env {
  LINEAR_API_KEY: string;
}

const LINEAR_MCP_URL = "https://mcp.linear.app/mcp";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/health" && request.method === "GET") {
      return new Response("ok", { status: 200 });
    }

    // MCP proxy endpoint
    if (url.pathname === "/mcp" && request.method === "POST") {
      if (!env.LINEAR_API_KEY) {
        return new Response("Missing LINEAR_API_KEY in Worker environment", {
          status: 500,
        });
      }

      // Clone headers and strip hop-by-hop / auth that we override
      const incomingHeaders = new Headers(request.headers);
      incomingHeaders.delete("host");
      incomingHeaders.delete("authorization");

      // Linear MCP expects JSON body; we just forward it
      const body = await request.arrayBuffer();

      const linearRequest = new Request(LINEAR_MCP_URL, {
        method: "POST",
        headers: {
          ...Object.fromEntries(incomingHeaders.entries()),
          "Authorization": `Bearer ${env.LINEAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body,
      });

      const linearResponse = await fetch(linearRequest);

      // Stream back status, headers, and body as-is
      const respHeaders = new Headers(linearResponse.headers);
      return new Response(linearResponse.body, {
        status: linearResponse.status,
        statusText: linearResponse.statusText,
        headers: respHeaders,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
