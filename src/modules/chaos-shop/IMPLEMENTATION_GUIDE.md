# 🛒 Module Guide: Chaos Shop
**Path**: `src/modules/chaos-shop`

This is a **Simulation API**. It pretends to be an E-commerce backend but is programmed to FAIL intentionally based on user input.

---

## 📂 Key Files

### 1. `middleware.ts` (The Chaos Engine)
This is where the fun happens. It looks for the `x-chaos-level` header (0-100).
-   Each request generates a random number (1-100).
-   If `random < chaosLevel`, it throws an error or sleeps (latency).

**Novice Logic:**
```typescript
if (Math.random() * 100 < chaosLevel) {
    const mode = pickRandom(['LATENCY', 'ERROR', 'GLITCH']);
    if (mode === 'LATENCY') await sleep(5000);
    if (mode === 'ERROR') return c.json({ error: 'Kaboom' }, 500);
}
```

### 2. `service.ts` (The Logic)
Standard CRUD operations for a shop, but running on D1 (SQLite).
-   `getProducts()`
-   `addToCart()`
-   `checkout()`

### 3. `router.ts` (The API)
Connects the web requests to the service.

---

## 🎓 Concepts Learned
-   **Resilience Testing**: How to build systems that survive bad APIs.
-   **Transactions**: The `checkout` logic (checking stock -> deducting money -> creating order) typically requires a transaction to ensure data integrity.
-   **KV Caching**: We stick user sessions in KV (Key-Value storage) for speed.
