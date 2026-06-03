# 🔐 Module Guide: Internal Authentication
**Path**: `src/modules/auth`

This module is the "Doorman" of the platform. It manages the API keys that developers use to access UtilNest services.

---

## 📂 Key Files

### 1. `middleware.ts` (The Bouncer)
This file is the most critical security component. It exports `authMiddleware` which intercepts every request.

**How it works for a Novice:**
1.  **Request Arrives**: Someone hits `/api/v1/shop/products`.
2.  **Exemption Check**: We explicitly check if the path is public (like `/docs` or `/api/health`). If so, we skip checks (`await next()`).
3.  **Header Check**: We look for `x-api-key`. No key? `401 Unauthorized`.
4.  **Database Lookup**: We ask the `AuthService` to find the key in the D1 database.
5.  **Context Injection**: If valid, we attach the user info to the request `context` (`c.set('user', user)`). This allows other modules to know *who* is calling them.

### 2. `service.ts` (The Manager)
Handles the business logic for standard API Keys.

**Key Methods:**
-   `createKey(owner)`: Generates a random string using `crypto.getRandomValues`.
    -   *Security Note*: It uses `SHA-256` to store a hash of the key. We **never** store the plain text key, just like a password.
-   `validateKey(key)`: Hashes the incoming key and checks if it matches any hash in the database.

### 3. `router.ts` (The Interface)
Exposes endpoints to create and revoke keys.

-   `POST /keys`: Create a new key. **Requires Authentication** via Kinde (Bearer Token).
-   `DELETE /keys/:prefix`: Revoke a key.

---

## 🎓 Concepts Learned
-   **Middleware Pattern**: Intercepting requests before they reach the handler.
-   **Hashing**: One-way encryption for security (comparing hashes, not secrets).
-   **Context Injection**: Passing data (user info) down the chain to other middleware or handlers.
-   **OAuth Integration**: Linking the stateless API Key to a detailed User Identity from Kinde.
