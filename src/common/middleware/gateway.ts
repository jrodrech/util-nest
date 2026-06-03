/**
 * API Gateway Middleware
 * 
 * Provides rate limiting and usage tracking for all protected API endpoints.
 * 
 * Features:
 * - Fixed Window Rate Limiting (per API key, per minute)
 * - Standard X-RateLimit-* headers
 * - Asynchronous usage analytics via D1
 */

import { Context, Next } from 'hono';
import { Bindings, Variables } from '../../types';

// ============================================================================
// Configuration
// ============================================================================

const RATE_LIMIT_CONFIG = {
    /** Default requests per minute */
    DEFAULT_LIMIT: 100,
    /** Window size in seconds */
    WINDOW_SECONDS: 60,
} as const;

// ============================================================================
// Types
// ============================================================================

interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
}

// ============================================================================
// Rate Limiting (KV-based Fixed Window)
// ============================================================================

/**
 * Generates a unique key for the rate limiter based on API key and time window.
 */
function getRateLimitKey(apiKeyId: string, windowSeconds: number): string {
    const currentWindow = Math.floor(Date.now() / 1000 / windowSeconds);
    return `rl:${apiKeyId}:${currentWindow}`;
}

/**
 * Checks and increments the rate limit counter.
 * Uses KV with TTL for automatic expiration.
 */
async function checkRateLimit(
    kv: Bindings['GATEWAY_RL'],
    apiKeyId: string,
    limit: number
): Promise<RateLimitResult> {
    const { WINDOW_SECONDS } = RATE_LIMIT_CONFIG;
    const key = getRateLimitKey(apiKeyId, WINDOW_SECONDS);

    // Get current count (atomic read)
    const currentCountStr = await kv.get(key);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    // Calculate reset time (end of current window)
    const currentWindowStart = Math.floor(Date.now() / 1000 / WINDOW_SECONDS) * WINDOW_SECONDS;
    const resetTime = currentWindowStart + WINDOW_SECONDS;

    // Check if limit exceeded
    if (currentCount >= limit) {
        return {
            allowed: false,
            limit,
            remaining: 0,
            resetTime,
        };
    }

    // Increment counter with TTL
    // Note: KV put is eventually consistent, but acceptable for this use case
    await kv.put(key, String(currentCount + 1), {
        expirationTtl: WINDOW_SECONDS + 5, // Small buffer for clock skew
    });

    return {
        allowed: true,
        limit,
        remaining: limit - currentCount - 1,
        resetTime,
    };
}

// ============================================================================
// Usage Analytics (D1-based Async Tracking)
// ============================================================================

/**
 * Records API usage to D1. Runs asynchronously after response.
 * Errors are logged but do not block the request (fail-open).
 */
async function recordUsage(
    db: D1Database,
    data: {
        apiKeyId: string;
        service: string;
        endpoint: string;
        method: string;
        statusCode: number;
        latencyMs: number;
    }
): Promise<void> {
    try {
        const id = crypto.randomUUID();
        await db.prepare(`
            INSERT INTO api_usage (id, api_key_id, service, endpoint, method, status_code, latency_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            data.apiKeyId,
            data.service,
            data.endpoint,
            data.method,
            data.statusCode,
            data.latencyMs
        ).run();
    } catch (error) {
        // Fail-open: Log but don't block
        console.error('[Gateway] Usage tracking error:', error);
    }
}

/**
 * Extracts the service name from the request path.
 * e.g., /api/v1/qrcode/generate -> "qrcode"
 */
function extractServiceName(path: string): string {
    const segments = path.split('/');
    // Path: /api/v1/<service>/...
    return segments[3] || 'unknown';
}

// ============================================================================
// Gateway Middleware
// ============================================================================

/**
 * Main gateway middleware that applies rate limiting and tracks usage.
 * 
 * Flow:
 * 1. Record start time
 * 2. Check rate limit (requires user context from authMiddleware)
 * 3. If blocked, return 429
 * 4. If allowed, proceed and inject headers
 * 5. After response, record usage asynchronously
 */
export const gatewayMiddleware = async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
) => {
    // Record start time for latency calculation
    const startTime = Date.now();
    c.set('startTime', startTime);

    // Get user from auth middleware (required)
    const user = c.get('user');
    if (!user) {
        // No user context = auth middleware didn't run or set user
        // This shouldn't happen if middleware ordering is correct
        console.warn('[Gateway] No user context found');
        await next();
        return;
    }

    const apiKeyId = user.id as string;

    // --- Rate Limiting ---
    const rateLimitResult = await checkRateLimit(
        c.env.GATEWAY_RL,
        apiKeyId,
        RATE_LIMIT_CONFIG.DEFAULT_LIMIT
    );

    // Always set rate limit headers
    c.header('X-RateLimit-Limit', String(rateLimitResult.limit));
    c.header('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    c.header('X-RateLimit-Reset', String(rateLimitResult.resetTime));

    // Block if rate limit exceeded
    if (!rateLimitResult.allowed) {
        c.header('Retry-After', String(rateLimitResult.resetTime - Math.floor(Date.now() / 1000)));
        return c.json({
            error: 'Rate Limit Exceeded',
            message: `You have exceeded the rate limit of ${rateLimitResult.limit} requests per minute.`,
            retryAfter: rateLimitResult.resetTime,
        }, 429);
    }

    // --- Proceed to Route Handler ---
    await next();

    // --- Usage Tracking (Async, after response) ---
    const latencyMs = Date.now() - startTime;
    const statusCode = c.res.status;
    const endpoint = c.req.path;
    const method = c.req.method;
    const service = extractServiceName(endpoint);

    // Use waitUntil for async D1 write (doesn't block response)
    c.executionCtx.waitUntil(
        recordUsage(c.env.DB, {
            apiKeyId,
            service,
            endpoint,
            method,
            statusCode,
            latencyMs,
        })
    );
};
