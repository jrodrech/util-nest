# 🛡️ Module Guide: Authentication Service
**Path**: `src/modules/auth-service`

This is the **Public Utility** version of auth. Unlike the internal `auth` module (which secures UtilNest itself), this module strictly provides **tools** for developers to secure *their own* apps.

---

## 📂 Key Files

### 1. `service.ts` (The Logic)
This file implements standard cryptography functions using the Web Crypto API.

**Key Logic:**
-   **`generateToken(payload)`**:
    1.  Takes a JSON payload (e.g., `{ userId: 123 }`).
    2.  Encodes it to Base64.
    3.  Signs it using **HMAC-SHA256** and a unique secret derived from the user's API key.
    4.  Returns a JWT (JSON Web Token) string: `header.payload.signature`.
-   **`hashPassword(password)`**:
    1.  Generates a random **Salt** (random bytes) so two users with the same password get different hashes.
    2.  Hashes `salt + password` using **SHA-256**.
    3.  Returns standard format: `$utilnest$v1$<salt>$<hash>`.

### 2. `router.ts` (The API)
Exposes the 4 helper endpoints:
-   `/tokens/generate`
-   `/tokens/validate`
-   `/passwords/hash`
-   `/passwords/verify`

**Novice Note**: Notice that we use `c.get('user')` here? That data was put there by the **Internal Auth** middleware! We use the user's `prefix` as part of the signing secret, ensuring one user can't validate another user's tokens.

---

## 🎓 Concepts Learned
-   **Statelessness**: We verify tokens using math (signatures), not by looking them up in a database limit.
-   **Salting**: Adding randomness to password hashes to prevent "Rainbow Table" attacks.
-   **Web Crypto API**: Using the browser-standard `crypto.subtle` instead of Node.js `crypto`.
