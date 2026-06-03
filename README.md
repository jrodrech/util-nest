# UtilNest

**A production-grade utility API platform — edge-deployed, authenticated, and fully automated.**

🌐 **Live:** https://cloudflare-api-platform.jrodrech.workers.dev/  
📖 **API Docs:** https://cloudflare-api-platform.jrodrech.workers.dev/docs/authentication

[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Edge Deployed](https://img.shields.io/badge/Latency-sub--50ms_globally-brightgreen)](#architecture-highlights)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What Is UtilNest?

UtilNest is a collection of practical utility APIs for developers — QR codes, mock e-commerce, fake user generation, link metadata — all running at the edge via Cloudflare Workers with **no cold starts and no servers to manage**.

It's also a reference implementation for modern serverless backend architecture: dual authentication (OAuth 2.0 + API keys), a custom API gateway with rate limiting, edge data persistence with D1 and KV, and a full CI/CD pipeline with isolated dev and prod environments.

> Built as a serious side project to practice and document the real-world patterns that come up in backend engineering interviews and production systems.

---

## Live API Suites

All suites are accessible via API key. [Get one in the developer portal →](https://cloudflare-api-platform.jrodrech.workers.dev/auth/login-ui)

| Suite | Endpoint | What It Does |
|---|---|---|
| 🎲 **ChaosShop** | `/api/v1/shop` | Mock e-commerce API with configurable failure rates and latency — ideal for testing client-side error/retry handling |
| 👤 **IdentityLease** | `/api/v1/leases` | Generates locale-aware fake user identities and "leases" them so E2E test runs don't collide |
| 🔗 **Link Preview** | `/api/v1/link-preview` | Fetches and caches OpenGraph + Twitter Card metadata for any URL, with a KV-backed edge cache |
| 📱 **QR Generator** | `/api/v1/qrcode` | Generates SVG QR codes on-the-fly — no storage, zero external dependencies |
| 🎬 **YouTube Meta** | `/api/v1/youtube` | Extracts video metadata without the YouTube Data API overhead |
| 🔐 **Auth** | `/api/v1/auth` | CRUD for API keys with SHA-256 hashing, prefix-based lookup, and RBAC |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Cloudflare Workers (V8 isolates) | Sub-50ms globally, no cold starts, free tier for bootstrapping |
| **Framework** | [Hono](https://hono.dev/) | 20KB vs Express's 200KB; built for edge runtimes, near-identical API |
| **Language** | TypeScript | Full type safety across all modules and bindings |
| **Relational DB** | Cloudflare D1 (SQLite at edge) | 15 tables, indexed queries, ACID transactions — no external DB needed |
| **Key-Value Store** | Cloudflare KV | 3 namespaces: URL cache, identity leases, rate-limit counters |
| **Auth — Users** | Kinde (OAuth 2.0) | Authorization Code Flow; tokens verified via JWKS, not stored |
| **Auth — APIs** | Custom API Key system | SHA-256 hashed, never stored plain; prefix index for O(log n) lookup |
| **API Gateway** | Custom Hono middleware | Rate limiting (fixed window, KV-backed) + async usage analytics (D1) |
| **Testing** | Vitest | 10 test files; unit tests for all middleware and services |
| **CI/CD** | GitHub Actions → Wrangler | Push to `development` → deploys to dev; push to `main` → deploys to prod |

---

## Architecture Highlights

### Dual Authentication
The platform handles two completely different authentication patterns in the same codebase:
- **OAuth 2.0 Authorization Code Flow** (Kinde) for the human-facing developer portal. The `access_token` is never exposed in a URL; the code-for-token exchange happens server-side.
- **Hashed API Keys** for programmatic access. Keys are SHA-256 hashed before storage — if the database is compromised, the hashes are irreversible and useless to an attacker.

### In-Process API Gateway
Rate limiting and usage analytics run as Hono middleware **inside** the same Worker, avoiding an extra network hop and separate billing:

```
Request → authMiddleware → gatewayMiddleware → Route Handler → Response
              ↓                   ↓
         Validates key      Checks KV counter
         Sets user ctx      Writes analytics
                           (non-blocking, waitUntil)
```

The gateway uses a **fail-closed** strategy for rate limiting (when KV is unavailable, block the request) and **fail-open** for analytics (an analytics write failure never blocks a legitimate API call).

### Edge-First Data Design

| Use Case | Storage | Reason |
|---|---|---|
| API keys, users, usage logs | **D1** | Needs relational queries (`WHERE prefix = ?`, `GROUP BY`) |
| URL preview cache | **KV** | Read-heavy, stale data acceptable, 1-hour TTL |
| Identity leases | **KV** | TTL-based auto-expiry, simple key lookup |
| Rate limit counters | **KV** | Ultra-fast reads, eventual consistency acceptable |

### Isolated Dev / Prod Environments
Two completely separate Cloudflare environments with their own D1 databases and KV namespaces. No shared state means dev testing never touches production data.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- An API key from the [developer portal](https://cloudflare-api-platform.jrodrech.workers.dev/auth/login-ui)

### Run Locally
```bash
git clone https://github.com/jrodrech/util-nest.git
cd util-nest
npm install
npm run dev        # Starts local Wrangler dev server at http://localhost:8787
```

### Run Tests
```bash
npm test           # Runs all Vitest unit tests
```

### Make an API Call
```bash
# Get your API key from the portal, then:
curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/qrcode/generate \
  -H "x-api-key: YOUR_KEY" \
  -G --data-urlencode "text=https://github.com/jrodrech/util-nest"
```

---

## Project Structure

```
src/
├── common/
│   ├── middleware/
│   │   └── gateway.ts          # Rate limiting + usage analytics middleware
│   └── errors.ts               # Global error handler
├── modules/
│   ├── auth/                   # API key CRUD (create, validate, revoke)
│   ├── user-auth/              # OAuth 2.0 flow + JWT validation via JWKS
│   ├── chaos-shop/             # Mock e-commerce with chaos engineering patterns
│   ├── identity-lease/         # Fake user generator with lease management
│   ├── link-preview/           # OpenGraph metadata scraper + KV cache
│   ├── qr-code/                # SVG QR code generation
│   └── youtube/                # YouTube video metadata
├── portal/                     # Server-rendered developer dashboard (Hono JSX)
└── index.ts                    # App entry point — routing and middleware registration
```

---

## Documentation

The `docs/` folder doubles as a study guide and interview prep resource. If you're learning serverless API development, start here:

| Guide | What You'll Learn |
|---|---|
| [Architecture Decisions](./docs/13-ARCHITECTURE-DECISIONS.md) | Why Workers over Lambda, Hono over Express, D1+KV over Postgres |
| [API Gateway Deep Dive](./docs/05-API-GATEWAY.md) | How rate limiting actually works at the code level |
| [Production Best Practices](./docs/08-PRODUCTION-BEST-PRACTICES.md) | Error handling, structured logging, circuit breakers, health checks |
| [Interview Preparation](./docs/12-INTERVIEW-PREPARATION.md) | System design questions answered with real code from this repo |
| [Troubleshooting](./docs/11-TROUBLESHOOTING.md) | Common D1/KV/Workers issues and how to fix them |

→ [Full documentation index](./docs/README.md)

---

## CI/CD Pipeline

```
Push to development  →  GitHub Actions  →  wrangler deploy --env dev   →  cloudflare-api-platform-dev
Push to main         →  GitHub Actions  →  wrangler deploy              →  cloudflare-api-platform (prod)
```

The workflow file lives at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) are stored in GitHub repository secrets — never in source code.

---

## What I Learned Building This

- The difference between **fail-open and fail-closed** isn't just theory — it's a real decision you make per-middleware based on what matters more: availability or correctness.
- **`waitUntil()`** is the key to non-blocking analytics in serverless: the response is sent to the user while the database write happens in the background.
- JWKS-based JWT verification is significantly more complex than "just decode the token," but it's the only approach that doesn't require storing secrets or hitting a /userinfo endpoint on every request.
- Edge KV's **eventual consistency** (up to 60s propagation) is a real constraint that shapes how you design features — it's why rate limiting uses it (acceptable edge case) but billing counters should not.

---

*Built by Joel Rodríguez · Miami, FL*  
*[LinkedIn](https://linkedin.com/in/joel-rodriguez-14a3685b) · [Live Demo](https://cloudflare-api-platform.jrodrech.workers.dev/)*
