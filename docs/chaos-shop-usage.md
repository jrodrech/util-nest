# ChaosShop API Usage Guide

**ChaosShop** is a mock E-commerce API designed to fail. Use it to test how your frontend handles latency, errors, and inventory race conditions.

**Base URL**: `https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop`

---

## 🎲 The Chaos Factor

The core feature of this API is the `x-chaos-level` header. It controls the probability (0-100%) that a request will fail or behave unexpectedly.

| Header | Value | Effect |
| :--- | :--- | :--- |
| `x-chaos-level` | `0` | **Perfect API**. Fast, reliable, 200 OK. (Default) |
| `x-chaos-level` | `20` | **20% Chance of Failure**. Good for occasional glitch testing. |
| `x-chaos-level` | `100` | **Guaranteed Failure**. 100% chance of latency or error. |

### Failure Modes
When chaos triggers, one of the following will happen:
1.  **Latency Spike**: The server sleeps for 2-5 seconds before responding (or timing out).
2.  **Hard Error**: Returns HTTP `500`, `502`, or `503`.
3.  **Soft Error**: Returns HTTP `200` but with an error body (e.g., `{"error": "Inventory mismatch"}`).
4.  **Data Corruption**: Returns malformed JSON (tests your parser's resilience).

---

## 🛒 Endpoints

### 1. List Products
Get the catalog of available items.

-   **Method**: `GET`
-   **Path**: `/products`
-   **Example**:
    ```bash
    curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/products \
      -H "x-chaos-level: 50"
    ```

### 2. Add to Cart
Add an item to your session cart.

-   **Method**: `POST`
-   **Path**: `/cart`
-   **Headers**:
    -   `Content-Type: application/json`
    -   `x-session-id`: (Optional) A string to identify your session. Defaults to `default-session`.
-   **Body**:
    ```json
    {
      "productId": "p_101",
      "quantity": 1
    }
    ```
-   **Example**:
    ```bash
    curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/cart \
      -H "Content-Type: application/json" \
      -H "x-session-id: my-test-user" \
      -d '{"productId": "p_101", "quantity": 1}'
    ```

### 3. Checkout
Process the order. This endpoint has logic to validate stock and clear the cart. It is the most "fragile" endpoint in a real system, making it great for chaos testing.

-   **Method**: `POST`
-   **Path**: `/checkout`
-   **Headers**:
    -   `x-session-id`: Must match the one used for the cart.
-   **Example**:
    ```bash
    curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/checkout \
      -H "x-session-id: my-test-user" \
      -H "x-chaos-level: 100"
    ```

### 4. Chaos Stats
View a report of how many chaos events have been triggered.

-   **Method**: `GET`
-   **Path**: `/stats`
-   **Example**:
    ```bash
    curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/stats
    ```
    **Response**:
    ```json
    {
      "total_requests": 150,
      "chaos_failures_triggered": 45,
      "simulated_timeouts": 12,
      "simulated_500s": 33,
      "simulated_corruptions": 0
    }
    ```

---

## 🧪 Testing Scenarios

### Scenario A: The "Happy Path"
Ensure your app works when the API is behaving.
1.  Set `x-chaos-level: 0`.
2.  Add items to cart.
3.  Checkout.
4.  Verify success message and order ID.

### Scenario B: The "Spinner Test" (Latency)
Test if your loading states work correctly.
1.  Set `x-chaos-level: 50` (or higher).
2.  Repeatedly hit `/products`.
3.  Observe if your app shows a skeleton loader or spinner during the random 2-5s delays.

### Scenario C: The "Error Boundary" (Hard Failures)
Test if your app crashes or shows a nice "Something went wrong" toast.
1.  Set `x-chaos-level: 100`.
2.  Hit `/checkout`.
3.  Verify your app handles 500/503 errors gracefully without white-screening.
