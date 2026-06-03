# 🎭 Module Guide: Identity Lease
**Path**: `src/modules/identity-lease`

This module solves a common testing problem: "I need a fake user that stays the same for 15 minutes."

---

## 📂 Key Files

### 1. `service.ts` (The Faker)
Uses `@faker-js/faker` to generate random people.
-   **The Twist**: We use **Cloudflare KV (Key-Value)** storage.
    -   When you request a user, we create one and store it in KV with an expiration (TTL).
    -   When you request it *again* (by ID), we fetch it from KV. This ensures consistency.

### 2. `router.ts` (The Endpoints)
-   `POST /leases`: Creation. Accepts `{ locale: 'fr_FR' }`.
-   `GET /leases/:id`: Retrieval.

**Novice Tip**:
Cloudflare KV is perfect here because it handles the "time to live" (TTL) automatically. We don't need to write a cleanup job to delete old users; Cloudflare just deletes them when the time is up.

---

## 🎓 Concepts Learned
-   **Transient State**: Storing data that is meant to expire is different from permanent data (SQL).
-   **Stateful Mocks**: Most mock APIs are stateless (random every time). This one remembers state.
-   **Localization**: Generating data specific to regions (French names, German addresses).
