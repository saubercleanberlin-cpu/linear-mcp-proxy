# linear-mcp-proxy

A Cloudflare Worker (TypeScript) that proxies MCP requests to [Linear's hosted MCP server](https://mcp.linear.app).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mcp` | Proxies the request body to Linear's MCP server with your API key |
| `GET` | `/health` | Returns `200 ok` — useful for uptime checks |

## How it works

1. Incoming `POST /mcp` requests are forwarded to `https://mcp.linear.app`
2. The worker injects your `LINEAR_API_KEY` as an `Authorization: Bearer <token>` header
3. The response (status, headers, body) is streamed back as-is

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Local development

Create a `.dev.vars` file (never commit this):

```
LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
```

Then run:

```bash
npm run dev
```

### 3. Deploy to Cloudflare

```bash
npm run deploy
```

After deploying, set the secret via the Cloudflare dashboard or CLI:

```bash
wrangler secret put LINEAR_API_KEY
```

Or via the dashboard: **Workers & Pages → your Worker → Settings → Variables → Add secret**

## Getting a Linear API Key

1. Go to [Linear Settings → API](https://linear.app/settings/api)
2. Create a personal API key
3. Set it as the `LINEAR_API_KEY` secret in your Worker

## Token Types

| Type | When to use |
|------|-------------|
| Personal API key (`lin_api_...`) | Single-user / personal automations |
| OAuth app token | Multi-user / team integrations |

Adjust the `Authorization` header format in `src/worker.ts` if Linear's MCP docs require a different header for your token type.

## Customisation

- To forward to a specific Linear workspace endpoint, update `LINEAR_MCP_URL` in `src/worker.ts`
- Add CORS headers in the response if you need browser clients to call this Worker directly
