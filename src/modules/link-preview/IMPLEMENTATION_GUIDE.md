# 🔗 Module Guide: Link Preview Service
**Path**: `src/modules/link-preview`

This module goes to a URL you provide and attempts to figure out what the "Preview Card" (like on Twitter or Slack) should look like.

---

## 📂 Key Files

### 1. `service.ts` (The Scraper)
This is a robust parser.
-   **Step 1**: Fetch the HTML of the target URL.
-   **Step 2**: Use Regular Expressions (Regex) to find `<meta property="og:title" content="...">`.
-   **Step 3 (Fallback)**: If OpenGraph (og) tags aren't found, try Twitter Cards (`twitter:title`). If those aren't found, try the `<title>` tag.

**Resilience Logic**:
Many sites block bots (like us). If the fetch fails (403 Forbidden), we don't crash. We return a "Basic" preview derived just from the domain name (e.g., "Content from example.com"). This ensures our API is **always available** even if the target is offline.

### 2. `router.ts` (The Cacher)
-   Since scraping is slow and expensive, we calculate a **Hash** of the URL.
-   We check **Cloudflare KV** first. If we scraped this URL in the last hour, return the cached JSON immediately.
-   If not, scrape -> cache -> return.

---

## 🎓 Concepts Learned
-   **Caching Strategy**: "Read-Through Caching" (Check Cache -> Miss -> Compute -> Save to Cache -> Return).
-   **Regex Parsing**: Extracting data from unstructured text (HTML).
-   **Graceful Degradation**: Always giving *some* useful answer instead of crashing.
