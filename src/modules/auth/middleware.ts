import { Context, Next } from 'hono'
import { AuthService } from './service'
import { Bindings } from '../../types'

import { ApiKeyRecord } from './service'

type Variables = {
    user: ApiKeyRecord
}

export const authMiddleware = async (c: Context<{ Bindings: Bindings, Variables: Variables }>, next: Next) => {
    // Skip auth for public paths (like docs, health, or the auth management itself)
    const path = c.req.path
    // Skip auth for public paths (docs, health) and specific auth management endpoints if needed
    // Note: /api/v1/auth-service MUST go through auth to get the user context
    if (path.startsWith('/docs') || path.startsWith('/api/health') || (path.startsWith('/api/v1/auth') && !path.startsWith('/api/v1/auth-service'))) {
        await next()
        return
    }

    const apiKey = c.req.header('x-api-key')

    if (!apiKey) {
        return c.json({ error: 'Missing API Key', message: 'Please provide x-api-key header' }, 401)
    }

    const authService = new AuthService(c.env.DB)
    const user = await authService.validateKey(apiKey)

    if (!user) {
        return c.json({ error: 'Invalid API Key', message: 'Access denied' }, 401)
    }

    // Attach user to context (if we had a type for it)
    c.set('user', user)

    await next()
}
