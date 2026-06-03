# 📘 The UtilNest Project Handbook
**A Developer's Guide to Cloudflare Workers, Hono, and Modern API Architecture**

---

## 👋 Introduction
Welcome! This handbook is designed to help you understand every inch of the **UtilNest** project. Since you have some background in Express.js, we will use that as a bridge to understand modern Serverless architecture.

This project is not just a bunch of files; it is a **Serverless Application** running on **Cloudflare Workers**.

---

## 🏗️ Architecture: Serverless vs. Traditional

### Traditional (e.g., Express + Node.js on a VPS)
-   **Server**: You run a process (`node index.js`) that listens on a port (e.g., 3000).
-   **State**: You might store variables in memory (variables stay alive between requests).
-   **Scaling**: If traffic spikes, your server crashes unless you add more servers.

### This Project (Cloudflare Workers)
-   **Serverless**: There is no "server" running 24/7. When a user makes a request, Cloudflare **spins up** a tiny isolate (like a browser tab) to handle *just that request*, and then shuts it down.
-   **Stateless**: You cannot rely on global variables staying alive. Everything must be stored in a database (D1) or Cache (KV).
-   **Scaling**: It scales infinitely automatically. 1 request or 1 million, Cloudflare handles it.

---

## 🚀 The Framework: Hono vs. Express

Used in: `src/index.ts`

We use **Hono**, a framework designed specifically for serverless edge workers. It looks very similar to Express!

| Concept | Express.js | Hono (This Project) |
|:---|:---|:---|
| **App Instance** | `const app = express()` | `const app = new Hono()` |
| **Request Object** | `req` | `c.req` (Inside Context) |
| **Response** | `res.json({...})` | `return c.json({...})` |
| **Context** | Passed separately (`req`, `res`) | **`c` (Context)** holds everything! |

### The "Context" (`c`)
In Hono, `c` is the magic object. It contains:
1.  **Request Data**: `c.req.param()`, `c.req.json()`.
2.  **Environment**: `c.env.DB` (Access to your database).
3.  **Helpers**: `c.json()`, `c.text()`.

**Check it out in code:**
See `src/modules/demo/router.ts`. Notice how every handler takes `c` as the argument.

---

## 🛑 Middleware: The Gatekeepers

Used in: `src/modules/auth/middleware.ts`

Middleware is a function that runs **before** your main route handler. It's used for security, logging, or modifying the request.

### How it works (The Chain)
1.  Request comes in.
2.  **Middleware** runs -> checks API Key.
3.  If Good -> calls `next()` -> Passes control to next handler.
4.  If Bad -> returns `401 Unauthorized` -> Request stops here.

### Deep Dive: `src/modules/auth/middleware.ts`

```typescript
export const authMiddleware = async (c, next) => {
    // 1. Check if the path is public (like health checks)
    if (path.startsWith('/api/health')) {
        await next(); // GO AHEAD
        return;
    }

    // 2. Get the header
    const apiKey = c.req.header('x-api-key');

    // 3. Validate
    if (!apiKey) return c.json({ error: 'Missing Key' }, 401);

    // 4. Attach User to Context
    // This is how we pass data from middleware to the actual route!
    c.set('user', user);

    // 5. Continue
    await next();
}
```

**Interview Tip**: "Middleware allows us to separate cross-cutting concerns (like Auth) from business logic."

---

## 💾 The Database: D1 (SQLite)

Used in: `src/modules/demo/service.ts`

We use **Cloudflare D1**, which is essentially SQLite running on the edge.

### The Pattern: Service Layer
We don't write SQL inside our Routes. We put it in a **Service**.
-   **Router** (`router.ts`): Handles HTTP (Status codes, params).
-   **Service** (`service.ts`): Handles Logic & Database.

**Example: `DemostService.listPlanets`**
```typescript
// PREPARE the statement (security against SQL injection)
// BIND the parameters (replace ? with values)
// ALL executes and returns an array
const result = await this.db.prepare(
    `SELECT * FROM galactic_planets LIMIT ? OFFSET ?`
).bind(limit, offset).all()
```

---

## 📁 Project Structure Tour

1.  **`wrangler.jsonc`**: The Configuration File.
    -   Tells Cloudflare what the worker is named.
    -   Defines the databases (`d1_databases`) and KVs.
    -   **Entry Point**: `main = "src/index.ts"`.

2.  **`src/index.ts`**: The Entry Point.
    -   Initializes the `Hono` app.
    -   Mounts all the sub-routers (`app.route('/api/v1/auth', authRouter)`).
    -   Global middleware is applied here (`app.use('*', ...)`).

3.  **`src/modules/*`**: The Feature Modules.
    -   We organize by **Feature**, not by type.
    -   Each folder (`demo`, `auth`, `shop`) contains its own `router`, `service`, and types.
    -   This makes the code easy to scale.

4.  **`schema.sql`**: The Blueprint.
    -   Defines your database tables.
    -   D1 allows you to apply this schema locally or remotely.

---

## 🎓 Concepts for Interviews

### 1. Dependency Injection
Notice `constructor(private db: D1Database)` in our Services?
We pass the database **into** the class. This makes it easy to test! We can pass a "fake" database in our unit tests.

### 2. Idempotency (`PUT` vs `POST`)
-   **POST**: "Create another one". (Run twice = 2 new planets).
-   **PUT**: "Replace this specific one". (Run twice = Same result).
See `demo/router.ts` implementation of `POST /planets` vs `PUT /planets/:id`.

### 3. Asynchronous Programming (`async/await`)
JavaScript is single-threaded. We use `await` when talking to the database so we don't block the implementation while waiting for the data to come back.

---

## 🔐 Modern Authentication Architecture

This project implements **OAuth 2.0** with **OpenID Connect (OIDC)**, the industry standard for user authentication.

### Why Kinde? (The Identity Provider)
Instead of storing passwords in our database (which is risky if not done perfectly), we delegate authentication to **Kinde**.
-   **We don't store passwords.** We store **User IDs**.
-   **We don't handle MFA.** Kinde handles it.
-   **We don't maintain login pages.** Kinde hosts them.

### Concepts for Interviews

#### 1. OAuth 2.0 Authorization Code Flow
This is the safest flow for web apps.
1.  **User Visits** `/auth/login`.
2.  **Redirect**: We send them to Kinde's hosted login page.
3.  **Auth Code**: After login, Kinde redirects them back to `/auth/callback?code=xyz`.
4.  **Exchange**: Our backend sends that code *back* to Kinde (server-to-server) to get the **Tokens**.
    -   **Access Token**: Used to access APIs.
    -   **ID Token**: Contains user info (name, email).

#### 2. JSON Web Tokens (JWT)
The Access Token we get is a JWT. It's a "User ID Card" that is cryptographically signed.
-   **Stateless**: We don't need to look up the user in the DB for every request. We just check the signature.
-   **Signature Verification**: We fetch Kinde's **Public Keys** (JWKS) to verify that *they* signed the token.

#### 3. Secrets Management
We never hardcode secrets (like `KINDE_CLIENT_SECRET`) in the code.
-   **Local**: Stored in `.dev.vars` (ignored by git).
-   **Production**: Stored in Cloudflare Encrypted Secrets (`npx wrangler secret put`).
-   **Access**: `c.env.KINDE_CLIENT_SECRET` in the code.

---

## 🛠️ How to Practice
1.  **Trace a Request**: Start at `src/index.ts`, follow `userAuthRouter` to `src/modules/user-auth/router.ts`.
2.  **Break it**: Go to `user-auth/service.ts` and change the expected `issuerUrl`. See the validation fail.
3.  **Add a Feature**: Try adding a new column `atmosphere` to the `galactic_planets` table in `schema.sql` and update the code to handle it.

