# 📖 Module Guide: Documentation Engine
**Path**: `src/modules/docs`

This module is a simple "Static Site Generator" built into our API. Instead of hosting docs on a separate site, we render them on the fly.

---

## 📂 Key Files

### 1. `service.ts` (The Content Store)
This file contains a large object `DOCS_CONTENT` where the keys are service IDs (e.g., `chaos-shop`) and the values are **Markdown Strings**.
-   **Method**: `getDocHtml(serviceId)`
    1.  Finds the markdown string.
    2.  Uses the `marked` library to convert Markdown (`# Hello`) into HTML (`<h1>Hello</h1>`).
    3.  Wraps it in a standard HTML template with valid `<head>` tags and CSS styles (GitHub Markdown CSS).

### 2. `router.ts` (The Renderer)
-   `GET /docs/:id`: Calls the service and returns `c.html(...)`.
-   **Novice Tip**: `c.html()` tells the browser "This is an HTML page, not JSON data", so it renders it visually.

---

## 🎓 Concepts Learned
-   **Server-Side Rendering (SSR)**: Generating HTML on the server before sending it to the client.
-   **Markdown Parsing**: How we turn developer-friendly text into browser-friendly code.
