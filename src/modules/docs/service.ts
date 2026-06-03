import { marked } from 'marked'
import { html } from 'hono/html'
import { BaseLayout } from '../../portal/components/base-layout'

// Simple mapping of service IDs to their markdown content
// In a real app, this would fetch from KV, D1, or static assets
const DOCS_CONTENT: Record<string, string> = {
  'youtube': `# YouTube Utility Suite

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/youtube\`

Extract rich metadata, transcripts, and audio streams from YouTube videos.

---

## 🔐 Authentication Required

All endpoints require your UtilNest API key. [Get your key here](/auth/login).

\`\`\`
x-api-key: sk_live_your_key_here
\`\`\`

---

## 📽️ Endpoints

### 1. Get Video Metadata
**GET** \`/info?url=https://www.youtube.com/watch?v=...\`

Returns title, author, and thumbnail info using oEmbed.

**Response**:
\`\`\`json
{
  "title": "Never Gonna Give You Up",
  "author_name": "Rick Astley",
  "type": "video",
  ...
}
\`\`\`

### 2. Get Transcript
**GET** \`/transcript?url=...\`

Extracts the closed captions (subtitles) if available.

**Response**:
\`\`\`json
{
  "language": "English",
  "captions": [
    { "start": 0.5, "duration": 3.2, "text": "We're no strangers to love" },
    ...
  ]
}
\`\`\`

### 3. Get Audio Stream
**GET** \`/audio?url=...\`

Redirects you to the direct audio stream URL (M4A/Opus). You can use this URL in an \`<audio>\` tag or with \`wget\`.

**Usage**:
\`\`\`html
<audio controls src="https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/youtube/audio?url=...&x-api-key=..."></audio>
\`\`\`

---

## ⚠️ Limitations
-   **IP Blocking**: YouTube aggressively limits requests from data centers. If you get a 429, wait a while.
-   **Audio Format**: We provide the raw stream (usually m4a), not MP3, to conserve server resources.
`,
  'learning-lab': `# The API Learning Lab 🪐

Welcome to the **Galactic Registry**. This API is designed to be your playground for mastering REST APIs.

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/demo\`

---

## 🚀 Postman Collection

The best way to learn is by doing. We've created a complete Postman collection for you.

[**Download Postman Collection**](/postman_collection.json)

### How to use:
1.  Download and install [Postman](https://www.postman.com/downloads/).
2.  Import the JSON file.
3.  Set the \`api_key\` variable in the collection to your UtilNest key.
4.  Start exploring!

---

## 🔐 Authentication
All endpoints require a valid API Key.

\`\`\`
x-api-key: sk_live_your_key_here
\`\`\`

---

## 📚 Core Concepts

### 1. Resources & Relationships
REST APIs are built around **Resources**. In this galaxy, our resources are:

-   **Planets** (Parent): Have terrain and habitability status.
-   **Species** (Child): Live on planets. (1 Planet -> Many Species)
-   **Starships**: Independent entities with stats.

### 2. HTTP Methods (CRUD)
We strictly follow REST conventions:

| Method | Action | Example | Meaning |
|:---|:---|:---|:---|
| \`GET\` | **Read** | \`GET /planets\` | "Give me a list of planets" |
| \`POST\` | **Create** | \`POST /planets\` | "Create a new planet" |
| \`PUT\` | **Update** | \`PUT /planets/1\` | "Replace planet #1" |
| \`DELETE\` | **Delete** | \`DELETE /planets/1\` | "Destroy planet #1" |

### 3. Status Codes
The server tells you what happened using numeric codes.

-   **200 OK**: Success! Here is your data.
-   **201 Created**: Success! I made the thing you asked for.
-   **404 Not Found**: I can't find that ID.
-   **422 Unprocessable Entity**: You sent bad data (e.g., missing name).

---

## 🧪 The Error Lab
Want to see how your app handles crashes? We have simulation endpoints.

| URL | Result | Why test this? |
|:---|:---|:---|
| \`/errors/400\` | \`400 Bad Request\` | Test invalid input handling. |
| \`/errors/401\` | \`401 Unauthorized\` | Test login expiration handling. |
| \`/errors/418\` | \`418 I'm a Teapot\` | Test unexpected codes. |
| \`/errors/500\` | \`500 Server Error\` | Test crash recovery. |

**Example**:
\`\`\`bash
curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/demo/errors/418 \\
  -H "x-api-key: your_key"
\`\`\`

---

## 🌌 Endpoints

### Planets

#### List Planets
\`GET /planets?page=1&limit=5\`

Returns a paginated list of discovered worlds.

#### Get Planet Details
\`GET /planets/:id\`

#### Create Planet
\`POST /planets\`

**Body**:
\`\`\`json
{
  "name": "Arrakis",
  "terrain": "Desert",
  "is_habitable": true
}
\`\`\`

### Species

#### Filter by Homeworld
\`GET /species?planet_id=1\`

Finds all species originating from a specific planet.

### Starships

#### Filter by Crew Size
\`GET /starships?min_crew=100\`

Finds capital ships capable of supporting large crews.
`,
  'authentication': `# Authentication Guide

Welcome to UtilNest! This guide explains how to authenticate and get your API key.

---

## 🚀 Quick Start

1. **Sign In** — Click the "Sign In" button to create an account or log in
2. **Create API Key** — After signing in, you'll receive your personal API key
3. **Use the Key** — Add the key to all API requests

---

## 🔐 Step 1: Sign In with Kinde

UtilNest uses **Kinde** for secure authentication. We don't store your password — Kinde handles all that securely.

1. Click the [Sign In](/auth/login) button
2. Create an account or log in with your existing credentials
3. You'll be redirected back to UtilNest with an access token

---

## 🔑 Step 2: Create Your API Key

After signing in, you can create API keys linked to your account.

**Using the API:**
\`\`\`bash
curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/auth/keys \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My App Key"}'
\`\`\`

**Response:**
\`\`\`json
{
  "message": "API Key created successfully!",
  "key": "sk_live_abc123...",
  "prefix": "sk_live_abc1",
  "name": "My App Key"
}
\`\`\`

> ⚠️ **Important:** Save your key immediately! You won't be able to see it again.

---

## 📤 Step 3: Use Your API Key

Add the key to every API request using the \`x-api-key\` header.

### Example with cURL
\`\`\`bash
curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/products \\
  -H "x-api-key: sk_live_your_key_here"
\`\`\`

### Example with JavaScript
\`\`\`javascript
const response = await fetch('https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/products', {
  headers: {
    'x-api-key': 'sk_live_your_key_here'
  }
});
const data = await response.json();
\`\`\`

### Example with Python
\`\`\`python
import requests

response = requests.get(
    'https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/products',
    headers={'x-api-key': 'sk_live_your_key_here'}
)
data = response.json()
\`\`\`

---

## ❌ Common Errors

### Missing API Key
\`\`\`json
{
  "error": "Unauthorized",
  "message": "API key required"
}
\`\`\`

**HTTP Status**: \`401 Unauthorized\`

---

## 🔒 Security Best Practices

1.  **Never share your key publicly** (e.g., in GitHub, client-side JavaScript).
2.  **Store it securely** (environment variables, secret managers).
3.  **Regenerate if compromised**: Sign in to create a new key.

---

## 🌐 Public Endpoints (No Key Required)

These endpoints do NOT require authentication:
-   \`/\` - Portal home page
-   \`/apis\` - API catalog
-   \`/auth/login\` - Sign In & Key Management
-   \`/docs/*\` - Documentation pages
-   \`/api/health\` - Health check
`,
  'auth-service': `# Authentication Service API

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/auth-service\`

A utility API for adding authentication to your applications. Generate JWT tokens, validate them, and securely hash passwords — all without building your own auth server.

---

## 🔐 Authentication Required

All endpoints require your UtilNest API key. [Get your key here](/auth/login).

\`\`\`
x-api-key: sk_live_your_key_here
\`\`\`

---

## 🎯 Why Use This?

| Problem | Solution |
|---------|----------|
| "I need to add login to my app" | Generate JWT tokens for your users |
| "I need to verify user sessions" | Validate tokens with one API call |
| "I need to store passwords securely" | Hash passwords with SHA-256 + salt |
| "I don't want to run an auth server" | Just call our API! |

---

## 📚 Endpoints

### 1. Generate JWT Token

Create a signed JSON Web Token for your users.

**POST** \`/tokens/generate\`

\`\`\`bash
curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/auth-service/tokens/generate \\
  -H "x-api-key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": {
      "userId": "user_123",
      "role": "admin"
    },
    "expiresIn": 3600
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-01-10T17:00:00Z"
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`payload\` | object | Custom data to include in the token |
| \`expiresIn\` | number | Seconds until expiration (default: 3600) |

---

### 2. Validate JWT Token

Verify a token and extract its payload.

**POST** \`/tokens/validate\`

\`\`\`bash
curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/auth-service/tokens/validate \\
  -H "x-api-key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
\`\`\`

**Response (valid):**
\`\`\`json
{
  "valid": true,
  "payload": {
    "userId": "user_123",
    "role": "admin",
    "iat": 1704909600,
    "exp": 1704913200
  }
}
\`\`\`

**Response (invalid):**
\`\`\`json
{
  "valid": false,
  "error": "Token expired"
}
\`\`\`

---

### 3. Hash Password

Securely hash a password for storage.

**POST** \`/passwords/hash\`

\`\`\`bash
curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/auth-service/passwords/hash \\
  -H "x-api-key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "password": "mySecurePassword123"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "hash": "$utilnest$v1$abc123...$def456...",
  "algorithm": "SHA-256 with salt"
}
\`\`\`

> **Store this hash in your database.** Never store plain passwords!

---

### 4. Verify Password

Check if a password matches a stored hash.

**POST** \`/passwords/verify\`

\`\`\`bash
curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/auth-service/passwords/verify \\
  -H "x-api-key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "password": "mySecurePassword123",
    "hash": "$utilnest$v1$abc123...$def456..."
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "match": true
}
\`\`\`

---

## 🔒 Security Notes

1. **Tokens are unique to your API key**: Tokens generated with your key can only be validated with the same key.
2. **Passwords are never logged**: We compute the hash and return it immediately.
3. **Use HTTPS**: Always call our API over HTTPS to protect your data in transit.

---

## 💡 Example: Login Flow

1. **User registers**: Hash their password via \`/passwords/hash\`, store the hash.
2. **User logs in**: Verify password via \`/passwords/verify\`.
3. **If valid**: Generate a JWT via \`/tokens/generate\`.
4. **On each request**: Validate the JWT via \`/tokens/validate\`.
`,
  'chaos-shop': `# ChaosShop API Usage Guide

**ChaosShop** is a mock E-commerce API designed to fail. Use it to test how your frontend handles latency, errors, and inventory race conditions.

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop\`

---

## 🔐 Authentication Required

All ChaosShop endpoints require an API key. [Get your key here](/auth/login).

Add the header to every request:
\`\`\`
x-api-key: sk_live_your_key_here
\`\`\`

See the full [Authentication Guide](/docs/authentication) for details.

---

## 🎲 The Chaos Factor

The core feature of this API is the \`x-chaos-level\` header. It controls the probability (0-100%) that a request will fail or behave unexpectedly.

| Header | Value | Effect |
| :--- | :--- | :--- |
| \`x-chaos-level\` | \`0\` | **Perfect API**. Fast, reliable, 200 OK. (Default) |
| \`x-chaos-level\` | \`20\` | **20% Chance of Failure**. Good for occasional glitch testing. |
| \`x-chaos-level\` | \`100\` | **Guaranteed Failure**. 100% chance of latency or error. |

### Failure Modes
When chaos triggers, one of the following will happen:
1.  **Latency Spike**: The server sleeps for 2-5 seconds before responding (or timing out).
2.  **Hard Error**: Returns HTTP \`500\`, \`502\`, or \`503\`.
3.  **Soft Error**: Returns HTTP \`200\` but with an error body (e.g., \`{"error": "Inventory mismatch"}\`).
4.  **Data Corruption**: Returns malformed JSON (tests your parser's resilience).

---

## 🛒 Endpoints

### 1. List Products
Get the catalog of available items.

-   **Method**: \`GET\`
-   **Path**: \`/products\`
-   **Example**:
    \`\`\`bash
    curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/products \\
      -H "x-api-key: sk_live_your_key" \\
      -H "x-chaos-level: 50"
    \`\`\`

### 2. Add to Cart
Add an item to your session cart.

-   **Method**: \`POST\`
-   **Path**: \`/cart\`
-   **Headers**:
    -   \`Content-Type: application/json\`
    -   \`x-api-key\`: Your API key.
    -   \`x-session-id\`: (Optional) A string to identify your session. Defaults to \`default-session\`.
-   **Body**:
    \`\`\`json
    {
      "productId": "p_101",
      "quantity": 1
    }
    \`\`\`

### 3. Checkout
Process the order. This endpoint has logic to validate stock and clear the cart. It is the most "fragile" endpoint in a real system, making it great for chaos testing.

-   **Method**: \`POST\`
-   **Path**: \`/checkout\`
-   **Headers**:
    -   \`x-api-key\`: Your API key.
    -   \`x-session-id\`: Must match the one used for the cart.
-   **Example**:
    \`\`\`bash
    curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/checkout \\
      -H "x-api-key: sk_live_your_key" \\
      -H "x-session-id: my-test-user" \\
      -H "x-chaos-level: 100"
    \`\`\`

### 4. Chaos Stats
View a report of how many chaos events have been triggered.

-   **Method**: \`GET\`
-   **Path**: \`/stats\`
-   **Example**:
    \`\`\`bash
    curl https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/stats \\
      -H "x-api-key: sk_live_your_key"
    \`\`\`
`,
  'link-preview': `# Link Preview Service

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/link-preview\`

Extracts rich metadata (OpenGraph, Twitter Cards) from any URL.

---

## 🔐 Authentication Required

This endpoint requires an API key. [Get your key here](/auth/login).

\`\`\`bash
curl "https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/link-preview?url=https://example.com" \\
  -H "x-api-key: sk_live_your_key"
\`\`\`

See the full [Authentication Guide](/docs/authentication) for details.

---

### Usage
\`GET /api/v1/link-preview?url=https://example.com\`

### Features
-   **Resilient Fallback**: Returns basic metadata even if target blocks bots.
-   **Caching**: 1 hour cache via KV.
-   **Security**: SSRF protection.
`,
  'qr-code': `# QR Code Generator

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/qrcode\`

Generates distinct QR codes on the fly. Returns **SVG (vector)** images.

---

## 🔐 Authentication Required

This endpoint requires an API key. [Get your key here](/auth/login).

\`\`\`bash
curl "https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/qrcode?text=Hello" \\
  -H "x-api-key: sk_live_your_key"
\`\`\`

See the full [Authentication Guide](/docs/authentication) for details.

---

### Usage
\`GET /api/v1/qrcode?text=Hello\`

### Parameters
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`text\` | string | **Required** | The content to encode. |
| \`format\` | string | \`svg\` | Output format: \`svg\` (default) or \`utf8\` (text). **PNG is not supported.** |
| \`scale\` | number | \`4\` | Size multiplier (higher = larger image). |
| \`margin\` | number | \`4\` | White space around the code. |
| \`dark\` | hex | \`#000000\` | Color of the modules (dots). |
| \`light\` | hex | \`#ffffff\` | Background color. |

### Examples
**Basic (SVG)**:
\`\`\`bash
<img src="https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/qrcode?text=UtilNest" />
\`\`\`

**Custom Colors (Blue on Yellow)**:
\`\`\`bash
GET /api/v1/qrcode?text=UtilNest&dark=%230000FF&light=%23FFFF00
\`\`\`

**Text Output (Terminal)**:
\`\`\`bash
curl "https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/qrcode?text=Console&format=utf8" \\
  -H "x-api-key: sk_live_your_key"
\`\`\`
`,
  'identity-lease': `# IdentityLease API

**Base URL**: \`https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/leases\`

A stateful mock-data API that provides consistent, temporary user identities for end-to-end testing.

---

## 🔐 Authentication Required

All IdentityLease endpoints require an API key. [Get your key here](/auth/login).

\`\`\`bash
curl -X POST https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/leases \\
  -H "x-api-key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"locale": "en_US"}'
\`\`\`

See the full [Authentication Guide](/docs/authentication) for details.

---

### Features
-   **Session Management**: Leases an identity for 15-60 minutes.
-   **Locale Locking**: Ensures name, address, and phone match (e.g., French name + French IBAN).
-   **Consistent Data**: Returns the same data for the session duration.

### Endpoints

#### 1. Create Lease
\`POST /api/v1/leases\`

**Body**:
\`\`\`json
{
  "locale": "fr_FR",
  "gender": "female",
  "ttl": 900
}
\`\`\`
*Supported Locales*: \`en_US\`, \`en_GB\`, \`de_DE\`, \`es_ES\`, \`fr_FR\`.

#### 2. Get Identity
\`GET /api/v1/leases/:id\`

Returns the full profile (Personal, Address, Finance).

#### 3. Terminate Lease
\`DELETE /api/v1/leases/:id\`

Destroys the session immediately.
`
}


export class DocsService {
  async getDocHtml(serviceId: string): Promise<any> {
    const markdown = DOCS_CONTENT[serviceId]
    if (!markdown) return null

    const content = await marked(markdown)

    const pageContent = html`
      <style>
        .doc-container { max-width: 900px; margin: 40px auto; padding: 0 24px; }
        .doc-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 40px; margin-top: 24px; }
        
        <main class="doc-container">
          ${content}
        </main>
    `

    return BaseLayout({
      title: `API Documentation - ${serviceId}`,
      children: pageContent,
      showNav: true
    })
  }
}
