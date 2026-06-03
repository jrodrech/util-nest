# 📚 UtilNest — Documentation Hub

> **A complete learning and reference guide for production-grade serverless API development.**  
> Every concept here is backed by real, deployed code you can read and run.

← [Back to project overview](../README.md)

---

## Who This Is For

| Audience | What You'll Get |
|---|---|
| 🎓 **Students & Learners** | A working codebase that teaches serverless, auth, and API design by example |
| 💼 **Job Seekers** | Real system design answers grounded in actual implementation decisions |
| 👩‍💻 **Developers** | A map to navigate the codebase and understand the "why" behind each pattern |

---

## 🗺️ Learning Paths

### Path 1: Brand New to Serverless
1. Read [PROJECT_HANDBOOK.md](../PROJECT_HANDBOOK.md) — Serverless vs Traditional, Hono vs Express
2. Clone the repo, run `npm run dev`, and trace a request through `src/index.ts`
3. Read [Architecture Decisions](./13-ARCHITECTURE-DECISIONS.md) — understand every technology choice
4. Deep dive into [API Gateway](./05-API-GATEWAY.md) — the most complex middleware in the project
5. Study [Interview Preparation](./12-INTERVIEW-PREPARATION.md) when you're ready to test yourself

### Path 2: Experienced Backend Developer
1. Start with [Architecture Decisions](./13-ARCHITECTURE-DECISIONS.md) — jump straight to trade-offs
2. Read [API Gateway & Rate Limiting](./05-API-GATEWAY.md) — Fixed Window vs Sliding Window, fail-open vs fail-closed
3. Review `src/modules/user-auth/service.ts` — JWKS-based JWT validation from scratch
4. Study [Production Best Practices](./08-PRODUCTION-BEST-PRACTICES.md) — patterns worth taking to your own projects

### Path 3: Interview Prep Mode
1. [Interview Preparation Guide](./12-INTERVIEW-PREPARATION.md) — system design questions with real code answers
2. [Architecture Decisions](./13-ARCHITECTURE-DECISIONS.md) — trade-off discussions (Workers vs Lambda, D1 vs Postgres)
3. Practice explaining: *"Design a rate limiter"*, *"Implement OAuth 2.0"*, *"Why KV instead of a database?"*

---

## 📖 Documentation Index

### Deep Dives (Available Now)
| Document | What It Covers | Difficulty |
|---|---|---|
| [API Gateway & Rate Limiting](./05-API-GATEWAY.md) | Fixed window algorithm, KV-backed counters, async analytics, `waitUntil()` | ⭐⭐⭐ |
| [Production Best Practices](./08-PRODUCTION-BEST-PRACTICES.md) | Error handling, structured logging, circuit breakers, health checks, secrets | ⭐⭐ |
| [Troubleshooting](./11-TROUBLESHOOTING.md) | D1 schema errors, CRLF issues, Wrangler auth, state reset | ⭐ |
| [Interview Preparation](./12-INTERVIEW-PREPARATION.md) | System design, coding challenges, STAR stories, mock scripts | ⭐⭐⭐ |
| [Architecture Decisions (ADRs)](./13-ARCHITECTURE-DECISIONS.md) | Why Workers, Hono, D1+KV, API keys, Fixed Window, in-process gateway | ⭐⭐ |

### Module-Level Guides
Each module in `src/modules/` contains its own `IMPLEMENTATION_GUIDE.md` covering the router, service layer, and key design decisions:

| Module | Location |
|---|---|
| Authentication (API Keys) | [`src/modules/auth/IMPLEMENTATION_GUIDE.md`](../src/modules/auth/IMPLEMENTATION_GUIDE.md) |
| OAuth 2.0 (User Auth) | [`src/modules/user-auth/IMPLEMENTATION_GUIDE.md`](../src/modules/user-auth/IMPLEMENTATION_GUIDE.md) |
| ChaosShop | [`src/modules/chaos-shop/IMPLEMENTATION_GUIDE.md`](../src/modules/chaos-shop/IMPLEMENTATION_GUIDE.md) |
| Identity Lease | [`src/modules/identity-lease/IMPLEMENTATION_GUIDE.md`](../src/modules/identity-lease/IMPLEMENTATION_GUIDE.md) |
| Link Preview | [`src/modules/link-preview/IMPLEMENTATION_GUIDE.md`](../src/modules/link-preview/IMPLEMENTATION_GUIDE.md) |
| QR Code | [`src/modules/qr-code/IMPLEMENTATION_GUIDE.md`](../src/modules/qr-code/IMPLEMENTATION_GUIDE.md) |
| YouTube Metadata | [`src/modules/youtube/IMPLEMENTATION_GUIDE.md`](../src/modules/youtube/IMPLEMENTATION_GUIDE.md) |

---

## 🔍 Quick Reference

### Where Is the Code For...?

| Feature | Code | Tests |
|---|---|---|
| API key creation & validation | `src/modules/auth/service.ts` | `test/modules/auth.test.ts` |
| OAuth 2.0 flow + JWKS verification | `src/modules/user-auth/service.ts` | — |
| Rate limiting (KV fixed window) | `src/common/middleware/gateway.ts` | `test/modules/gateway.test.ts` |
| Usage analytics (async D1 writes) | `src/common/middleware/gateway.ts` | `test/modules/gateway.test.ts` |
| OpenGraph scraping + cache | `src/modules/link-preview/service.ts` | — |
| QR code SVG generation | `src/modules/qr-code/service.ts` | `test/modules/qr-code.test.ts` |
| Developer portal (SSR) | `src/portal/` | — |

### How Do I...?

**Add a new API module**
```
1. Copy src/modules/demo/ as a starting template
2. Create router.ts + service.ts
3. Mount in src/index.ts: app.route('/api/v1/your-module', yourRouter)
4. Add tests in test/modules/your-module.test.ts
```

**Run locally**
```bash
npm install
npm run dev       # Wrangler dev server at http://localhost:8787
npm test          # Vitest unit tests
```

**Deploy**
```bash
git push origin development   # → deploys to cloudflare-api-platform-dev
git push origin main          # → deploys to cloudflare-api-platform (prod)
```

**Reset local state** (if D1 or KV gets corrupted)
```bash
rm -rf .wrangler/state/v3
npx wrangler d1 execute api-platform-db --local --file=schema.sql
npm run dev
```

---

## 📊 Codebase at a Glance

| Metric | Value |
|---|---|
| API modules | 10 (`src/modules/`) |
| Middleware | 3 (Auth, Gateway, Chaos) |
| D1 database tables | 15 |
| KV namespaces | 3 (Cache, Leases, Rate Limiting) |
| Test files | 10 |
| CI/CD environments | 2 (dev, prod) |
| Lines of TypeScript | ~3,000 |

---

## 🎓 Concepts You Can Explain After Studying This Repo

**System Design**
- Design a rate limiter — [answer grounded in this code](./05-API-GATEWAY.md)
- Build a dual-auth system (OAuth + API keys) — [answer grounded in this code](./12-INTERVIEW-PREPARATION.md)
- Design a caching strategy for a global edge API — [answer grounded in this code](./13-ARCHITECTURE-DECISIONS.md)

**Technical Trade-offs**
- Why Cloudflare Workers over AWS Lambda
- Why D1 for relational data but KV for caching
- When to fail-open vs fail-closed
- Why hash API keys instead of encrypting them

**Behavioral (STAR Stories)**
- *"Tell me about a time you optimized for performance"* → `waitUntil()` async analytics
- *"Describe a debugging session"* → JWKS key mismatch in JWT validation
- *"How do you handle backward compatibility?"* → Wrangler environments and migration files

---

*Part of the UtilNest project by [Joel Rodríguez](https://linkedin.com/in/joel-rodriguez-14a3685b)*
