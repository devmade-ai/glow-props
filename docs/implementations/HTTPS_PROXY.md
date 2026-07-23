---
slug: https-proxy
title: HTTPS Proxy Support
badge: Infrastructure
description: Zero-dependency HTTP CONNECT tunnel for Node.js scripts behind proxies. Transparent fallback to direct connections.
tags:
  - Node.js stdlib
  - HTTP CONNECT
  - Proxy auth
order: 6
---

# HTTPS Proxy Support for Node.js Scripts

Zero-dependency HTTP CONNECT tunnel for Node.js scripts that need to reach external APIs through an HTTPS proxy. Solves the problem that Node.js's built-in `fetch()` (undici) and `https.get()` **do not** respect `HTTP_PROXY`/`HTTPS_PROXY` environment variables.

## The Problem

In proxy-only environments (CI containers, Claude Code remote sessions, corporate networks), outbound traffic must route through an HTTP proxy. But:

- **`fetch()` (Node 18+ built-in)**: Uses undici internally. Does NOT auto-detect `HTTP_PROXY`/`HTTPS_PROXY` env vars. Requests fail with DNS errors.
- **`https.get()`**: Also does NOT respect proxy env vars. Same DNS failure.
- **`curl`**: Works — it reads `HTTP_PROXY`/`HTTPS_PROXY` automatically. But shelling out to curl from Node is ugly.
- **`global-agent` / `proxy-agent` packages**: Work, but add external dependencies for a simple tunnel.

## The Solution

Detect the proxy from environment variables, establish an HTTP CONNECT tunnel, then pipe the HTTPS request through the tunnel socket. Pure `http`/`https` stdlib — no dependencies.

```javascript
import http from 'http';
import https from 'https';

// --- Proxy detection ---
// Check both lowercase and uppercase conventions.
// HTTPS_PROXY is used for HTTPS requests; HTTP_PROXY for HTTP requests.
// Most environments set both to the same value.
const PROXY_URL = process.env.https_proxy || process.env.HTTPS_PROXY || null;

function getProxyConnectOptions(targetHost) {
  const proxy = new URL(PROXY_URL);
  const options = {
    host: proxy.hostname,
    port: proxy.port,
    method: 'CONNECT',
    path: `${targetHost}:443`,
    headers: { 'Host': `${targetHost}:443` },
    timeout: 15000,
  };
  // Proxy authentication (username:password in proxy URL)
  if (proxy.username) {
    const auth = Buffer.from(
      decodeURIComponent(proxy.username) + ':' + decodeURIComponent(proxy.password)
    ).toString('base64');
    options.headers['Proxy-Authorization'] = `Basic ${auth}`;
  }
  return options;
}

// --- HTTPS GET with automatic proxy support ---
// When PROXY_URL is set: HTTP CONNECT tunnel -> HTTPS over tunnel
// When PROXY_URL is null: Direct HTTPS request
function httpsGet(requestUrl, headers = {}) {
  const parsed = new URL(requestUrl);
  if (PROXY_URL) {
    return httpsGetViaProxy(parsed, headers);
  }
  return httpsGetDirect(parsed, headers);
}

// --- Shared response handler (deduplicates between direct and proxy paths) ---
function handleResponse(res) {
  return new Promise((resolve, reject) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      resolve({ status: res.statusCode, data: JSON.parse(data) });
    });
  });
}

function httpsGetDirect(parsed, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(parsed.href, { headers, timeout: 15000 }, (res) => {
      handleResponse(res).then(resolve).catch(reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function httpsGetViaProxy(parsed, headers) {
  return new Promise((resolve, reject) => {
    const connectOptions = getProxyConnectOptions(parsed.hostname);
    const proxyReq = http.request(connectOptions);

    proxyReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`Proxy CONNECT failed: ${res.statusCode}`));
        return;
      }
      // TLS handshake through the tunnel
      const tlsReq = https.get({
        host: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers,
        socket,              // Reuse the CONNECT tunnel socket
        servername: parsed.hostname, // Required for SNI
        timeout: 15000,
      }, (tlsRes) => {
        handleResponse(tlsRes).then(resolve).catch(reject);
      });
      tlsReq.on('error', reject);
      tlsReq.on('timeout', () => { tlsReq.destroy(); reject(new Error('Request timeout')); });
    });

    proxyReq.on('error', reject);
    proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Proxy connect timeout')); });
    proxyReq.end();
  });
}

// --- Retry wrapper with rate-limit handling ---
// Retries on errors and HTTP 429 with exponential backoff.
// maxRetries = number of retries after the initial attempt (3 = 4 total attempts).
// Adapted from fh-fuelhunt's fetchWithRetry (which uses "total attempts" semantics).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, headers = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await httpsGet(url, headers);
      if (result.status === 429) {
        if (attempt < maxRetries) {
          const delay = (attempt + 1) * 2000;
          console.warn(`Rate limited (429), retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        throw new Error(`Rate limited after ${maxRetries} retries`);
      }
      if (result.status >= 200 && result.status < 300) {
        return result.data;
      }
      throw new Error(`HTTP ${result.status}`);
    } catch (error) {
      if (attempt < maxRetries && !String(error).includes('Rate limited')) {
        const delay = (attempt + 1) * 1000;
        console.warn(`Request failed, retrying in ${delay}ms...`, error.message);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}
```

**Log proxy status at startup** for diagnostics:

```javascript
function logProxyStatus() {
  if (PROXY_URL) {
    const proxy = new URL(PROXY_URL);
    console.log(`Using proxy: ${proxy.hostname}:${proxy.port}`);
  } else {
    console.log('No proxy configured — using direct HTTPS');
  }
}
```

**Usage:**

```javascript
// Basic — returns { status, data }. Works identically whether proxy is set or not.
const result = await httpsGet('https://api.example.com/status', {
  'User-Agent': 'MyApp/1.0',
});
console.log(result.status, result.data);

// With retry — handles rate limiting and transient errors automatically
const data = await fetchWithRetry('https://api.example.com/items', {
  'User-Agent': 'MyApp/1.0',
});
```

**For curl in shell scripts:**

```bash
# curl respects HTTP_PROXY/HTTPS_PROXY automatically — no code changes needed.
# If the env var is named differently (e.g., GLOBAL_AGENT_HTTP_PROXY), pass it explicitly:
curl -x "$GLOBAL_AGENT_HTTP_PROXY" https://api.example.com/status
```

## How It Works

1. **Detect proxy** from `HTTPS_PROXY` or `https_proxy` env var
2. **HTTP CONNECT** — send a `CONNECT targethost:443` request to the proxy. The proxy establishes a TCP tunnel to the target.
3. **TLS over tunnel** — once the proxy responds `200`, pass the raw socket to `https.get()` via the `socket` option. Node performs the TLS handshake through the tunnel.
4. **Transparent fallback** — when no proxy env var is set, `httpsGet()` uses direct `https.get()`. Same API, zero config.

## Key Lessons

1. **Node's `fetch()` and `https.get()` ignore proxy env vars** — unlike `curl`, Python `requests`, or Go's `http.Client`, Node does not auto-detect `HTTP_PROXY`. This is a long-standing design choice, not a bug.
2. **HTTP CONNECT is the standard** — it's how all HTTPS proxying works. The proxy sees only the target hostname, not the request content (TLS encrypts everything after the tunnel opens).
3. **`socket` + `servername` are both required** — `socket` reuses the tunnel; `servername` enables SNI so the target server presents the correct TLS certificate.
4. **Auth uses Basic scheme** — proxy credentials are sent as `Proxy-Authorization: Basic base64(user:pass)` in the CONNECT request. URL-decode the username/password first (they may be percent-encoded in the URL).
5. **Shared `handleResponse()`** — deduplicate response parsing between direct and proxy paths. Returns `{ status, data }` so callers can distinguish 429 from other errors.
6. **`fetchWithRetry()` handles rate limiting** — exponential backoff with longer delays for 429 (2s, 4s, 6s) than for errors (1s, 2s, 3s). Configurable retry count, defaults to 3.
7. **Log proxy status at startup** — `logProxyStatus()` announces proxy hostname or direct mode for diagnostics in CI/CD scripts.
8. **No external dependencies needed** — `global-agent`, `proxy-agent`, `https-proxy-agent` packages solve this too, but for scripts that just need GET requests, the stdlib solution above is simpler and has zero supply chain risk.
9. **`curl` just works** — it reads `HTTP_PROXY`/`HTTPS_PROXY` automatically. Use it for quick tests: `curl -x "$HTTPS_PROXY" https://example.com`.
