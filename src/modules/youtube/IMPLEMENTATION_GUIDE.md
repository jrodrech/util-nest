# 📺 Module Guide: YouTube Utility Suite
**Path**: `src/modules/youtube`

This module extracts hidden data from YouTube.

---

## 📂 Key Files

### 1. `service.ts` (The Miner)
This file has advanced scraping logic.
-   **Metadata**: Uses the official `oEmbed` endpoint. This is the only "stable" part of the API.
-   **Transcript**: It fetches the actual video page HTML and looks for a hidden javascript variable: `ytInitialPlayerResponse`. This JSON object contains the caption track URLs. It parses that JSON, fetches the XML caption file, and converts it to JSON.
-   **Audio**: It also finds the `streamingData` in that same hidden variable to find the direct URL to the M4A/Opus audio stream.

### 2. `router.ts` (The Proxy)
-   `/audio`: Does **not** download the audio. That would be too slow.
-   Instead, it returns `c.redirect(audioUrl, 302)`. This sends the user's browser directly to YouTube's CDN servers to stream the file. This is a "Redirect Proxy".

---

## 🎓 Concepts Learned
-   **Reverse Engineering**: Finding data that isn't officially documented by inspecting HTML.
-   **Redirects (302)**: Offloading bandwidth heavy tasks (streaming audio) to the original source instead of tunneling it through your server.
-   **Fragility**: Realizing that screen-scraping logic can break anytime the target site changes their HTML structure.
