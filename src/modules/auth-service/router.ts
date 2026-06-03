import { Hono } from 'hono'
import { AuthServiceService } from './service'

type Variables = {
    user: { prefix: string, owner: string, permissions: string[] }
}

const router = new Hono<{ Variables: Variables }>()

/**
 * POST /api/v1/auth-service/tokens/generate
 * Generate a signed JWT token
 */
router.post('/tokens/generate', async (c) => {
    try {
        const body = await c.req.json()
        const { payload, expiresIn } = body

        if (!payload || typeof payload !== 'object') {
            return c.json({ error: 'payload is required and must be an object' }, 400)
        }

        // Get user's API key prefix to derive unique signing secret
        const user = c.get('user')
        if (!user?.prefix) {
            return c.json({ error: 'Authentication required' }, 401)
        }

        const service = new AuthServiceService(user.prefix)
        const result = await service.generateToken(payload, expiresIn || 3600)

        return c.json(result, 201)
    } catch (e) {
        return c.json({ error: 'Invalid request body' }, 400)
    }
})

/**
 * POST /api/v1/auth-service/tokens/validate
 * Validate a JWT and return its claims
 */
router.post('/tokens/validate', async (c) => {
    try {
        const body = await c.req.json()
        const { token } = body

        if (!token || typeof token !== 'string') {
            return c.json({ error: 'token is required' }, 400)
        }

        const user = c.get('user')
        if (!user?.prefix) {
            return c.json({ error: 'Authentication required' }, 401)
        }

        const service = new AuthServiceService(user.prefix)
        const result = await service.validateToken(token)

        return c.json(result)
    } catch (e) {
        return c.json({ error: 'Invalid request body' }, 400)
    }
})

/**
 * POST /api/v1/auth-service/passwords/hash
 * Hash a password securely
 */
router.post('/passwords/hash', async (c) => {
    try {
        const body = await c.req.json()
        const { password } = body

        if (!password || typeof password !== 'string') {
            return c.json({ error: 'password is required' }, 400)
        }

        if (password.length < 8) {
            return c.json({ error: 'Password must be at least 8 characters' }, 400)
        }

        const user = c.get('user')
        if (!user?.prefix) {
            return c.json({ error: 'Authentication required' }, 401)
        }

        const service = new AuthServiceService(user.prefix)
        const result = await service.hashPassword(password)

        return c.json(result, 201)
    } catch (e) {
        return c.json({ error: 'Invalid request body' }, 400)
    }
})

/**
 * POST /api/v1/auth-service/passwords/verify
 * Verify a password against a hash
 */
router.post('/passwords/verify', async (c) => {
    try {
        const body = await c.req.json()
        const { password, hash } = body

        if (!password || typeof password !== 'string') {
            return c.json({ error: 'password is required' }, 400)
        }

        if (!hash || typeof hash !== 'string') {
            return c.json({ error: 'hash is required' }, 400)
        }

        const user = c.get('user')
        if (!user?.prefix) {
            return c.json({ error: 'Authentication required' }, 401)
        }

        const service = new AuthServiceService(user.prefix)
        const result = await service.verifyPassword(password, hash)

        return c.json(result)
    } catch (e) {
        return c.json({ error: 'Invalid request body' }, 400)
    }
})

export { router as authServiceRouter }
