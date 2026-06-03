# 📋 Architecture Decision Records (ADRs)

> **Why we made the technical choices we did**

---

## What is an ADR?

An **Architecture Decision Record** documents a significant technical decision, including:
- The context and problem
- The options considered
- The decision made
- The consequences (trade-offs)

**Purpose**: Help future you (and teammates) understand "Why did we do it this way?"

---

## Table of Contents
1. [ADR-001: Cloudflare Workers over AWS Lambda](#adr-001-cloudflare-workers-over-aws-lambda)
2. [ADR-002: Hono over Express.js](#adr-002-hono-over-expressjs)
3. [ADR-003: D1 + KV over PostgreSQL](#adr-003-d1--kv-over-postgresql)
4. [ADR-004: API Keys over JWT for API Auth](#adr-004-api-keys-over-jwt-for-api-auth)
5. [ADR-005: Fixed Window Rate Limiting](#adr-005-fixed-window-rate-limiting)
6. [ADR-006: Middleware-based API Gateway](#adr-006-middleware-based-api-gateway)
7. [ADR-007: Module-based Project Structure](#adr-007-module-based-project-structure)

---

## ADR-001: Cloudflare Workers over AWS Lambda

**Status**: ✅ Accepted  
**Date**: 2025-01-10  
**Deciders**: Architecture Team

### Context
Need to deploy a globally-distributed serverless API platform.

### Options Considered

1. **AWS Lambda + API Gateway**
   - ✅ Mature ecosystem
   - ✅ Large community
   - ❌ Cold starts (100-1000ms)
   - ❌ Regional (need  multiple deployments)
   - ❌ Complex networking (VPC, subnets)

2. **Cloudflare Workers**
   - ✅ Edge deployment (300+ locations)
   - ✅ Fast cold starts (<10ms, V8 isolates)
   - ✅ Simple deployment (single global instance)
   - ❌ Smaller ecosystem
   - ❌ CPU time limits (50ms per request)

3. **Google Cloud Functions**
   - ✅ Good for GCP ecosystem
   - ❌ Cold starts similar to Lambda
   - ❌ Regional deployment

### Decision
We chose **Cloudflare Workers**.

### Rationale
1. **Latency**: 10ms cold starts vs 100ms+ for Lambda
2. **Global Distribution**: Single deployment, 300+ edge locations
3. **Cost**: Free tier (100K requests/day), then $0.50/million
4. **Developer Experience**: Deploy with `wrangler deploy`
5. **Use Case Fit**: Our APIs are compute-light (<10ms CPU), perfect for Workers

### Consequences

**Positive:**
- ✅ Ultra-low latency for users worldwide
- ✅ Simple infrastructure (no VPCs, load balancers)
- ✅ Cost-effective for "start free" model

**Negative:**
- ❌ 50ms CPU limit (can't run heavy processing)
- ❌ Smaller community (fewer Stack Overflow answers)
- ❌ Must use Cloudflare ecosystem (D1, KV, R2)

**Mitigation:**
- For heavy processing: Offload to Cloudflare Queues + Durable Objects
- For ecosystem lock-in: Use standard Web APIs (fetch, Request/Response)

---

## ADR-002: Hono over Express.js

**Status**: ✅ Accepted  
**Date**: 2025-01-10

### Context
Need a web framework that runs on Cloudflare Workers.

### Options Considered

1. **Express.js**
   - ✅ Very popular, huge ecosystem
   - ❌ Designed for Node.js (not Workers)
   - ❌ Large bundle size (~200KB)

2. **Hono**
   - ✅ Built for edge runtimes (Workers, Deno, Bun)
   - ✅ Tiny (<20KB)
   - ✅ Web Standards (Request/Response)
   - ❌ Smaller ecosystem

3. **Itty Router**
   - ✅ Very small (<1KB)
   - ❌ Minimal features (no middleware chaining)

### Decision
We chose **Hono**.

### Rationale
1. **Bundle Size**: 20KB vs 200KB (10x smaller)
2. **Performance**: Benchmarks show 3x faster than Express on Workers
3. **Web Standards**: Uses `fetch()`, `Request`, `Response` (portable)
4. **Middleware**: Rich middleware ecosystem (CORS, JWT, etc.)
5. **Syntax**: Very similar to Express (easy migration)

**Code Comparison:**
```typescript
// Express
app.get('/users/:id', (req, res) => {
    res.json({ id: req.params.id })
})

// Hono (almost identical!)
app.get('/users/:id', (c) => {
    return c.json({ id: c.req.param('id') })
})
```

### Consequences

**Positive:**
- ✅ Fast, lightweight, edge-optimized
- ✅ Easy for Express developers to learn

**Negative:**
- ❌ Fewer third-party plugins
- ❌ Less Stack Overflow content

---

## ADR-003: D1 + KV over PostgreSQL

**Status**: ✅ Accepted  
**Date**: 2025-01-10

### Context
Need database(s) for:
- Relational data (users, API keys)
- Caching (URL previews, sessions)

### Options Considered

1. **PostgreSQL (RDS/Supabase)**
   - ✅ Full SQL, transactions
   - ❌ Not edge-native (latency)
   - ❌ Expensive for global deployment

2. **MongoDB Atlas**
   - ✅ Flexible schema
   - ❌ Not serverless-friendly
   - ❌ Cost prohibitive for free tier

3. **Cloudflare D1 (SQLite) + KV**
   - ✅ Edge-native (low latency)
   - ✅ Free tier available
   - ✅ **D1**: Strong consistency, SQL
   - ✅ **KV**: Eventually consistent, ultra-fast
   - ❌ KV has 60s propagation delay

### Decision
We chose **D1 for relational data, KV for caching**.

### Decision Matrix

| Use Case | Storage | Why |
|----------|---------|-----|
| API Keys | D1 | Need `WHERE prefix = ?` and `is_active` check |
| Users | D1 | Relational (JOIN with api_keys) |
| Usage Analytics | D1 | Need SQL aggregations (`GROUP BY`) |
| URL Previews | KV | Stale data acceptable, read-heavy |
| Rate Limiting | KV | Ultra-fast reads, eventual consistency OK |
| Sessions | KV | TTL auto-expiry, simple key-value |

### Consequences

**Positive:**
- ✅ Low latency (both at the edge)
- ✅ Cost-effective (generous free tiers)
- ✅ Right tool for each job

**Negative:**
- ❌ KV eventual consistency (60s delay)
- ❌ Two systems to manage

**Mitigation:**
- Document when to use D1 vs KV clearly
- Add retry logic for KV writes

---

## ADR-004: API Keys over JWT for API Auth

**Status**: ✅ Accepted  
**Date**: 2025-01-15

### Context
Need to authenticate programmatic API access (curl, Postman, CI/CD).

### Options Considered

1. **JWT Tokens**
   - ✅ Stateless (no DB lookup)
   - ❌ Short-lived (need refresh flow)
   - ❌ Complex for developers (manage expiry)

2. **API Keys (long-lived)**
   - ✅ Simple for developers (one key, copy-paste)
   - ✅ Easy revocation (update DB)
   - ❌ Requires DB lookup (latency)

### Decision
We chose **API Keys** (hashed in database).

### Rationale
1. **Developer Experience**: "Here's your key, use it forever" is simpler than "Refresh your token every hour"
2. **Use Case**: APIs are for scripts/automation, not interactive users
3. **Security**: Hash keys (SHA-256), never store plain text
4. **Revocation**: Update `is_active = 0`, instant effect

**Implementation:**
```typescript
// Generate
const key = `sk_live_${randomBytes(24)}`  // Visible ONCE
const hash = sha256(key)                  // Store in D1

// Validate
const providedHash = sha256(providedKey)
const match = db.query('SELECT * WHERE key_hash = ?', [providedHash])
```

### Consequences

**Positive:**
- ✅ Simple for developers
- ✅ Long-lived (no refresh logic)

**Negative:**
- ❌ DB lookup on every request (10ms latency)
- ❌ If key leaks, valid until revoked

**Mitigation:**
- Cache valid keys in KV (reduce DB load)
- Add API key rotation feature (future)
- Log all key usage (detect leaks)

---

## ADR-005: Fixed Window Rate Limiting

**Status**: ✅ Accepted  
**Date**: 2025-01-25

### Context
Need to prevent API abuse with rate limiting.

### Options Considered

1. **Fixed Window**
   - ✅ Simple (count requests per minute)
   - ❌ Spike at window edges (199 at :59, 1 at :00 = 200 in 2 seconds)

2. **Sliding Window**
   - ✅ Accurate (smooth limit)
   - ❌ Complex (need sorted sets or multiple keys)

3. **Token Bucket**
   - ✅ Handles bursts well
   - ❌ Requires background refill process

### Decision
We chose **Fixed Window** for Phase 1.

### Rationale
1. **Simplicity**: Single KV key per window (`rl:{key}:{minute}`)
2. **Performance**: Fast (single `kv.get()` + `kv.put()`)
3. **Good Enough**: Edge spike issue is rare in practice
4. **Future Path**: Can upgrade to Sliding Window in Phase 2

**Implementation:**
```typescript
const window = Math.floor(Date.now() / 60000)  // Minutes since epoch
const key = `rl:${apiKeyId}:${window}`
const count = await kv.get(key) || 0
if (count >= 100) return 429  // Blocked
await kv.put(key, count + 1, { expirationTtl: 65 })
```

### Consequences

**Positive:**
- ✅ Easy to implement and understand
- ✅ Low memory usage (one key per window)

**Negative:**
- ❌ Edge spike vulnerability (100 req at :59, 100 at :00 = 200/sec)

**Mitigation (Phase 2):**
- Implement Sliding Window Log (store timestamps)
- Use Durable Objects for atomic counter across regions

---

## ADR-006: Middleware-based API Gateway

**Status**: ✅ Accepted  
**Date**: 2025-01-25

### Context
Need to add rate limiting and usage tracking without modifying every API module.

### Options Considered

1. **Separate Gateway Worker**
   - ✅ Complete isolation
   - ❌ Extra network hop (latency)
   - ❌ Additional cost

2. **Middleware in Same Worker**
   - ✅ Zero latency (same process)
   - ✅ Zero cost (no extra Worker)
   - ❌ Tightly coupled

3. **Service Mesh (Istio/Envoy)**
   - ✅ Enterprise-grade
   - ❌ Massive overkill for serverless
   - ❌ Complex setup

### Decision
We chose **Middleware in Same Worker** for Phase 1.

### Rationale
1. **Latency**: No extra hop (sub-millisecond overhead)
2. **Cost**: Free (no additional Workers)
3. **Simplicity**: Standard middleware pattern
4. **Sufficient**: For Phase 1 scale (100K req/day)

**Code:**
```typescript
app.use('/api/v1/*', authMiddleware)      // Step 1: Auth
app.use('/api/v1/*', gatewayMiddleware)   // Step 2: Rate limit + analytics
```

### Consequences

**Positive:**
- ✅ Fast, simple, cost-effective
- ✅ Easy to test (unit test middleware directly)

**Negative:**
- ❌ Coupled to main Worker (can't scale independently)
- ❌ All modules share same CPU limit (50ms)

**Future (Phase 3):**
- If scale requires, extract to dedicated Worker
- Use Service Bindings for RPC (still low latency)

---

## ADR-007: Module-based Project Structure

**Status**: ✅ Accepted  
**Date**: 2025-01-10

### Context
Need to organize code for 10+ API modules.

### Options Considered

1. **Monolithic (all in `index.ts`)**
   - ❌ Unmaintainable at scale

2. **Type-based (`/routes`, `/services`, `/models`)**
   - ✅ Common pattern (MVC)
   - ❌ Files scattered (auth route is in `/routes`, auth service in `/services`)

3. **Feature-based (`/modules/auth`, `/modules/shop`)**
   - ✅ All related files together
   - ✅ Easy to add/remove features

### Decision
We chose **Feature-based (modules)**.

### Structure
```
src/
├── modules/
│   ├── auth/
│   │   ├── router.ts
│   │   ├── service.ts
│   │   └── middleware.ts
│   ├── shop/
│   │   ├── router.ts
│   │   └── service.ts
│   └── ...
└── common/
    ├── errors.ts
    └── middleware/
```

### Rationale
1. **Cohesion**: Everything for "auth" is in one folder
2. **Scalability**: Add new feature = new folder
3. **Discoverability**: New dev knows where to find auth code
4. **Testing**: Easy to test modules independently

### Consequences

**Positive:**
- ✅ Clear organization
- ✅ Easy to delete a feature (delete folder)

**Negative:**
- ❌ Some duplication (each module has its own types)

**Mitigation:**
- Use `common/` for truly shared utilities
- Document module structure in handbook

---

## Summary: Key Decisions

| What | Why | Trade-off Accepted |
|------|-----|-------------------|
| **Workers** | Edge latency | 50ms CPU limit |
| **Hono** | Lightweight, fast | Smaller ecosystem |
| **D1 + KV** | Right tool per job | Two systems to manage |
| **API Keys** | Simple DX | DB lookup latency |
| **Fixed Window** | Simple to implement | Edge spike risk |
| **Middleware** | Zero latency/cost | Coupled architecture |
| **Modules** | Clear organization | Some duplication |

---

**Interview Tip**: When asked "Why did you choose X?", reference these ADRs  to show **thoughtful decision-making** and **trade-off awareness**.
