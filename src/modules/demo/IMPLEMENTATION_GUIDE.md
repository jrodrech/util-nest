# 🪐 Module Guide: The API Learning Lab (Demo)
**Path**: `src/modules/demo`

This module implements the **Galactic Registry**. It is strictly an educational resource ("The Bible") to teach REST API concepts.

---

## 📂 Key Files

### 1. `service.ts` (The Data Layer)
Talks to the D1 database (`galactic_planets`, etc.).
-   **Novice Tip**: Notice we always use `prepare(...).bind(...)`? This is to prevent **SQL Injection**, where a hacker puts SQL code into the URL to steal data. Binding separates code from data.

### 2. `router.ts` (The Rest Interface)
Implements strictly standard REST methods:
-   `GET /planets` (Read)
-   `POST /planets` (Create)
-   `PUT /planets/:id` (Update/Replace)
-   `DELETE /planets/:id` (Delete)

### 3. The Error Lab (`/errors/:status`)
This part of the router intentionally returns whatever status code you ask for.
```typescript
router.get('/errors/:status', (c) => {
    // If user asks for 418, we give them 418.
    return c.json({ error: true }, status);
})
```

---

## 🎓 Concepts Learned
-   **REST Semantics**: Learning when to use specific methods.
-   **Status Codes**: Understanding that `200` means OK, `201` means Created, and `4xx` means Client Error.
-   **Pagination**: The `listPlanets` function uses `LIMIT` and `OFFSET` in SQL to return data in chunks ("pages").
