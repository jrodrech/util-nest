/**
 * Gateway Middleware Tests
 * 
 * Unit tests for rate limiting logic and usage tracking.
 * Uses vitest with mocked Cloudflare bindings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mock Factories
// ============================================================================

/**
 * Creates a mock KV namespace for rate limiting tests.
 */
function createMockKV(initialData: Record<string, string> = {}) {
    const store = new Map<string, string>(Object.entries(initialData))
    return {
        get: vi.fn((key: string) => Promise.resolve(store.get(key) || null)),
        put: vi.fn((key: string, value: string) => {
            store.set(key, value)
            return Promise.resolve()
        }),
        delete: vi.fn((key: string) => {
            store.delete(key)
            return Promise.resolve()
        }),
    }
}

/**
 * Creates a mock D1 database for usage tracking tests.
 */
function createMockD1() {
    const insertedRows: any[] = []
    return {
        prepare: vi.fn(() => ({
            bind: vi.fn((...args: any[]) => ({
                run: vi.fn(() => {
                    insertedRows.push(args)
                    return Promise.resolve({ meta: { changes: 1 } })
                }),
            })),
        })),
        _getInsertedRows: () => insertedRows,
    }
}

// ============================================================================
// Rate Limiting Logic Tests
// ============================================================================

describe('Rate Limiting Logic', () => {
    let mockKV: ReturnType<typeof createMockKV>

    beforeEach(() => {
        vi.clearAllMocks()
        mockKV = createMockKV()
    })

    /**
     * Simulates the rate limit check logic from gateway.ts
     */
    async function checkRateLimit(
        kv: ReturnType<typeof createMockKV>,
        apiKeyId: string,
        limit: number,
        windowSeconds: number = 60
    ) {
        const currentWindow = Math.floor(Date.now() / 1000 / windowSeconds)
        const key = `rl:${apiKeyId}:${currentWindow}`

        const currentCountStr = await kv.get(key)
        const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0

        const currentWindowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds
        const resetTime = currentWindowStart + windowSeconds

        if (currentCount >= limit) {
            return {
                allowed: false,
                limit,
                remaining: 0,
                resetTime,
            }
        }

        await kv.put(key, String(currentCount + 1), { expirationTtl: windowSeconds + 5 } as any)

        return {
            allowed: true,
            limit,
            remaining: limit - currentCount - 1,
            resetTime,
        }
    }

    it('should allow first request (counter = 0)', async () => {
        const result = await checkRateLimit(mockKV, 'test-key', 100)

        expect(result.allowed).toBe(true)
        expect(result.limit).toBe(100)
        expect(result.remaining).toBe(99)
        expect(result.resetTime).toBeGreaterThan(0)
    })

    it('should decrement remaining on each request', async () => {
        // First request
        const result1 = await checkRateLimit(mockKV, 'test-key', 100)
        expect(result1.remaining).toBe(99)

        // Second request (counter now at 1)
        const result2 = await checkRateLimit(mockKV, 'test-key', 100)
        expect(result2.remaining).toBe(98)

        // Third request
        const result3 = await checkRateLimit(mockKV, 'test-key', 100)
        expect(result3.remaining).toBe(97)
    })

    it('should block when limit is reached', async () => {
        // Pre-populate at the limit
        mockKV.get.mockResolvedValue('100')

        const result = await checkRateLimit(mockKV, 'test-key', 100)

        expect(result.allowed).toBe(false)
        expect(result.remaining).toBe(0)
    })

    it('should calculate reset time correctly', async () => {
        const result = await checkRateLimit(mockKV, 'test-key', 100, 60)

        // Reset time should be within 60 seconds from now
        const now = Math.floor(Date.now() / 1000)
        expect(result.resetTime).toBeGreaterThanOrEqual(now)
        expect(result.resetTime).toBeLessThanOrEqual(now + 60)
    })

    it('should use unique key per API key', async () => {
        await checkRateLimit(mockKV, 'key-A', 100)
        await checkRateLimit(mockKV, 'key-B', 100)

        const putCalls = mockKV.put.mock.calls
        const keys = putCalls.map(call => call[0] as string)

        expect(keys.some(k => k.includes('key-A'))).toBe(true)
        expect(keys.some(k => k.includes('key-B'))).toBe(true)
    })

    it('should store counter with TTL', async () => {
        await checkRateLimit(mockKV, 'test-key', 100, 60)

        expect(mockKV.put).toHaveBeenCalled()
        const options = mockKV.put.mock.calls[0][2] as { expirationTtl: number }
        expect(options.expirationTtl).toBe(65) // window + 5s buffer
    })
})

// ============================================================================
// Usage Tracking Logic Tests
// ============================================================================

describe('Usage Tracking Logic', () => {
    let mockD1: ReturnType<typeof createMockD1>

    beforeEach(() => {
        vi.clearAllMocks()
        mockD1 = createMockD1()
    })

    /**
     * Simulates the usage recording logic from gateway.ts
     */
    async function recordUsage(
        db: ReturnType<typeof createMockD1>,
        data: {
            apiKeyId: string
            service: string
            endpoint: string
            method: string
            statusCode: number
            latencyMs: number
        }
    ) {
        const id = crypto.randomUUID()
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
        ).run()
    }

    it('should insert usage record to D1', async () => {
        await recordUsage(mockD1, {
            apiKeyId: 'key-123',
            service: 'qrcode',
            endpoint: '/api/v1/qrcode',
            method: 'GET',
            statusCode: 200,
            latencyMs: 45,
        })

        expect(mockD1.prepare).toHaveBeenCalled()
        const insertedRows = mockD1._getInsertedRows()
        expect(insertedRows.length).toBe(1)
    })

    it('should include all required fields', async () => {
        await recordUsage(mockD1, {
            apiKeyId: 'key-123',
            service: 'qrcode',
            endpoint: '/api/v1/qrcode',
            method: 'GET',
            statusCode: 200,
            latencyMs: 45,
        })

        const insertedRows = mockD1._getInsertedRows()
        const [id, apiKeyId, service, endpoint, method, statusCode, latencyMs] = insertedRows[0]

        expect(id).toBeDefined() // UUID
        expect(apiKeyId).toBe('key-123')
        expect(service).toBe('qrcode')
        expect(endpoint).toBe('/api/v1/qrcode')
        expect(method).toBe('GET')
        expect(statusCode).toBe(200)
        expect(latencyMs).toBe(45)
    })
})

// ============================================================================
// Service Name Extraction Tests
// ============================================================================

describe('Service Name Extraction', () => {
    /**
     * Extracts service name from path (mirrors gateway.ts logic)
     */
    function extractServiceName(path: string): string {
        const segments = path.split('/')
        return segments[3] || 'unknown'
    }

    it('should extract service from standard path', () => {
        expect(extractServiceName('/api/v1/qrcode/generate')).toBe('qrcode')
        expect(extractServiceName('/api/v1/shop/products')).toBe('shop')
        expect(extractServiceName('/api/v1/youtube/info')).toBe('youtube')
    })

    it('should return unknown for malformed paths', () => {
        expect(extractServiceName('/api/v1')).toBe('unknown')
        expect(extractServiceName('/api')).toBe('unknown')
        expect(extractServiceName('/')).toBe('unknown')
    })
})
