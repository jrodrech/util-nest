import { Hono } from 'hono'
import { AuthService } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

// POST /api/v1/auth/keys
router.post('/keys', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const owner = body.owner || 'Anonymous Subscriber'
    const permissions = body.permissions || []

    const service = new AuthService(c.env.DB)
    const result = await service.createKey(owner, permissions)

    return c.json({
        message: 'API Key created. Save it now, you wont see it again.',
        key: result.key,
        prefix: result.prefix,
        owner
    }, 201)
})

// DELETE /api/v1/auth/keys/:prefix
router.delete('/keys/:prefix', async (c) => {
    const prefix = c.req.param('prefix')
    const service = new AuthService(c.env.DB)

    await service.revokeKey(prefix)
    return c.json({ message: 'Key revoked' })
})

// DEBUG
// DEBUG
router.get('/debug/:key', async (c) => {
    const key = c.req.param('key')
    const service = new AuthService(c.env.DB)
    const hash = await service['hashKey'](key) as string // Access private method via index signature or just cast
    const prefix = key.substring(0, 12)

    const dbResult = await c.env.DB.prepare(`SELECT * FROM api_keys WHERE prefix = ?`).bind(prefix).all()
    const validationResult = await service.validateKey(key)

    const dbHash = dbResult.results?.[0]?.key_hash

    return c.json({
        key,
        prefix,
        computedHash: hash,
        dbHash,
        hashMatch: hash === dbHash,
        computedLength: hash.length,
        dbHashLength: dbHash?.length,
        validationResult,
        isActiveCheck: dbResult.results?.[0]?.is_active ? 'truthy' : 'falsy'
    })
})

export { router as authRouter }
