# 📱 Module Guide: QR Code Generator
**Path**: `src/modules/qr-code`

This is a **Stateless Utility**. It takes text and turns it into an image. It saves nothing to the database.

---

## 📂 Key Files

### 1. `service.ts` (The Encoder)
Uses a library (`qrcode`) to generate the matrix of black and white dots.
-   **Logic**: It configures the "Correction Level" (redundancy) so the code works even if slightly damaged.
-   **Output**: It returns an **SVG string**. SVG is text-based vector graphics, which is perfect for APIs because it's small and scales infinitely without pixelation.

### 2. `router.ts` (The Delivery)
-   `GET /`: Returns the SVG.
-   **Headers**: We set `Content-Type: image/svg+xml`. This is crucial! It tells the browser "Treat this response as an image, not text". This allows you to put the API URL directly into an `<img>` tag: `<img src="/api/v1/qrcode?text=hi" />`.

---

## 🎓 Concepts Learned
-   **Content-Type Headers**: How the server tells the client what kind of data is coming (JSON vs HTML vs SVG).
-   **Stateless Processing**: Input -> Math -> Output. No database needed.
