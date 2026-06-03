# 🔑 Module Guide: User Authentication (OAuth 2.0)
**Path**: `src/modules/user-auth`

This module implements **OAuth 2.0 Authorization Code Flow** with Kinde as the identity provider.

---

## 🎓 Core Concepts

### OAuth 2.0 Authorization Code Flow
1. **User clicks Login** → Redirected to Kinde's hosted login page
2. **User enters credentials** → Kinde handles password, MFA, social login, etc.
3. **Kinde redirects back** → Our `/auth/callback` receives an **Authorization Code**
4. **Code Exchange** → We trade the code for **Access Token** (server-to-server, secure)
5. **Token Usage** → User sends `Authorization: Bearer <token>` on subsequent requests

### JWT (JSON Web Token)
A JWT is a signed, base64-encoded JSON object. It has 3 parts:
- **Header**: Algorithm info (`{"alg": "RS256"}`)
- **Payload**: User data (`{"sub": "kp_123", "email": "..."}`)
- **Signature**: Cryptographic proof (verified using Kinde's public keys)

### JWKS (JSON Web Key Set)
Kinde publishes their public keys at:
`https://yourapp.kinde.com/.well-known/jwks.json`

We use these keys to **verify** JWT signatures without contacting Kinde per-request.

---

## 📂 Key Files

### 1. `service.ts` (The Cryptographer)
**Key Methods:**
-   `getLoginUrl(state)`: Builds the Kinde authorization URL
-   `exchangeCodeForTokens(code)`: Trades auth code for tokens
-   `validateToken(token)`: Verifies JWT signature using JWKS

**JWT Validation Steps:**
1.  Split token into header.payload.signature
2.  Decode header to get `kid` (Key ID)
3.  Fetch JWKS from Kinde (cached for 1 hour)
4.  Find matching public key
5.  Import key using Web Crypto API
6.  Verify signature mathematically
7.  Check expiration and issuer

### 2. `router.ts` (The Gatekeeper)
**Endpoints:**
-   `GET /auth/login` → Redirects to Kinde login
-   `GET /auth/callback` → Handles post-login redirect
-   `GET /auth/logout` → Logs user out
-   `GET /auth/me` → Returns current user info
-   `POST /auth/keys` → Creates API key linked to user

---

## 🔐 Security Features
1.  **JWKS Caching**: Public keys cached to avoid rate limits
2.  **State Parameter**: CSRF protection (should be enhanced in production)
3.  **User-Scoped Keys**: API keys are linked to `user_id` in database

---

## 🎓 Interview Concepts
-   **OAuth 2.0 vs OpenID Connect**: OAuth is for authorization, OIDC adds identity layer
-   **Asymmetric Cryptography**: Public key verifies, private key signs
-   **Stateless Authentication**: No session storage needed; JWT contains all info
