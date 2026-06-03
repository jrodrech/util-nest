# 🔧 Troubleshooting Guide

> **Solutions to common issues when developing UtilNest on Cloudflare Workers**

---

## 🔍 Debugging Workflow

1.  **Check the logs**: `npx wrangler tail`
2.  **Check the status**: `/api/health`
3.  **Check local state**: `.wrangler/state/v3/` (local D1/KV files)

---

## ⚡ Cloudflare Workers Issues

### "Worker Error: Error: No such module"
**Symptoms**: Application crashes on startup.
**Cause**: You imported a huge library that uses Node.js specifics (like `fs` or `net`) or the file path is wrong.
**Fix**:
1. Check imports. Ensure you aren't using Node.js-only packages.
2. Use relative paths starting with `./` for local files.
3. Check `wrangler.jsonc` main entry point.

### "Error: CPU Time Limit Exceeded"
**Symptoms**: Request fails with 500 or gets cut off.
**Cause**: Your worker took more than 50ms of CPU time (Free tier limit).
**Fix**:
1. Optimize loops.
2. Ensure you are `await`ing async/IO operations (IO doesn't count toward CPU time).
3. Offload heavy work to `c.executionCtx.waitUntil()`.

---

## 💾 Database (D1) Issues

### "Error: SQLITE_ERROR: no such table: X"
**Symptoms**: 500 error when accessing an API endpoint.
**Cause**: The database schema hasn't been applied to your local or remote DB.
**Fix**:
1. **Local**: `npx wrangler d1 execute api-platform-db --local --file=schema.sql`
2. **Remote**: `npx wrangler d1 execute api-platform-db --remote --file=schema.sql`

### "Error: SQLITE_CONSTRAINT: UNIQUE constraint failed"
**Symptoms**: Insert/Update fails.
**Cause**: You are trying to insert a record with a Primary Key or Unique field that already exists.
**Fix**:
- Check if you are generating unique IDs (UUIDs).
- Use `INSERT OR IGNORE` or `INSERT ... ON CONFLICT` if duplicates are expected.

---

## 🔑 Authentication Issues

### "401 Unauthorized" with Valid Key
**Symptoms**: You send `x-api-key`, but get 401.
**Cause**:
1. The key in the DB is hashed, but you are sending the raw key (Correct behavior).
2. The hashing algorithm used to verify doesn't match the one used to create.
3. The key is disabled (`is_active = 0`).
**Fix**:
- Check the `api_keys` table: `SELECT * FROM api_keys`.
- Verify the prefix matches.

### "Kinde Login Redirects to 404"
**Symptoms**: After logging in at Kinde, you get a 404.
**Cause**: The call back URL in Kinde doesn't match your Worker URL.
**Fix**:
- Go to Kinde Dashboard > App details.
- Ensure "Allowed Callback URLs" includes `http://localhost:8787/auth/callback`.

---

## 📦 Dependency Issues

### "Vite/Vitest Error: Cannot find package"
**Symptoms**: `npm test` fails.
**Cause**: Cloudflare workers environment issues with Vitest.
**Fix**:
- Ensure `vitest.config.ts` has `defineWorkersConfig`.
- Run `npm install` to ensure `@cloudflare/vitest-pool-workers` is correct.

---

## 🐛 How to Reset Local State

If everything is broken locally (DB locked, KV weirdness):

1. **Stop the server**: Ctrl+C
2. **Delete local state**:
   ```bash
   rm -rf .wrangler/state/v3
   ```
3. **Re-apply schema**:
   ```bash
   npx wrangler d1 execute api-platform-db --local --file=schema.sql
   ```
4. **Restart**: `npm run dev`

---

**Still stuck?**
Ask the AI assistant: "I am seeing error X in file Y, please help me debug."
