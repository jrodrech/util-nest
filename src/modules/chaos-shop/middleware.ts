import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { D1Database } from '@cloudflare/workers-types'

type Bindings = {
    DB: D1Database
}

// Encapsulate logic for easier testing
export class ChaosEngine {
    shouldFail(level: number): boolean {
        return Math.random() * 100 < level
    }

    determineFailureMode(): 'latency' | '5xx' | 'corruption' | 'soft' {
        const roll = Math.random()
        if (roll < 0.3) return 'latency'
        if (roll < 0.6) return '5xx'
        if (roll < 0.8) return 'corruption'
        return 'soft'
    }
}

export const chaosMiddleware = async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const chaosLevelHeader = c.req.header('x-chaos-level')
    const chaosLevel = chaosLevelHeader ? parseInt(chaosLevelHeader, 10) : 0

    // Validate header
    if (isNaN(chaosLevel) || chaosLevel < 0 || chaosLevel > 100) {
        await next()
        return
    }

    // Track total requests
    await incrementStat(c.env.DB, 'total_requests')

    const engine = new ChaosEngine()

    // Chaos Roll
    if (engine.shouldFail(chaosLevel)) {
        await incrementStat(c.env.DB, 'chaos_failures_triggered')

        const mode = engine.determineFailureMode()

        if (mode === 'latency') {
            await incrementStat(c.env.DB, 'simulated_timeouts')
            const delay = 2000 + Math.random() * 3000
            await new Promise(r => setTimeout(r, delay))
            throw new HTTPException(504, { message: 'Gateway Timeout (Simulated)' })
        }

        if (mode === '5xx') {
            await incrementStat(c.env.DB, 'simulated_500s')
            const errors = [500, 502, 503]
            const status = errors[Math.floor(Math.random() * errors.length)] as any
            throw new HTTPException(status, { message: 'Chaos Monkey struck!' })
        }

        if (mode === 'corruption') {
            await incrementStat(c.env.DB, 'simulated_corruptions')
            c.status(200)
            return c.body('{"error": "This JSON is broken...', 200, { 'Content-Type': 'application/json' })
        }

        // Soft Error
        return c.json({ error: 'Inventory mismatch', code: 'INVENTORY_ERROR' }, 200)
    }

    await next()
}

async function incrementStat(db: D1Database, key: string) {
    try {
        // Upsert counter
        await db.prepare(`
      INSERT INTO shop_stats (key, value) VALUES (?, 1)
      ON CONFLICT(key) DO UPDATE SET value = value + 1
    `).bind(key).run()
    } catch (e) {
        console.error('Failed to update stats:', e)
    }
}
