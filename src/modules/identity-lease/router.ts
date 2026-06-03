import { Hono } from 'hono'
import { IdentityLeaseService, CreateLeaseOptions } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

router.post('/', async (c) => {
    try {
        const body = await c.req.json() as CreateLeaseOptions

        // Basic Validation
        const validLocales = ['en_US', 'en_GB', 'de_DE', 'es_ES', 'fr_FR']
        if (body.locale && !validLocales.includes(body.locale)) {
            return c.json({ error: 'Invalid locale. Supported: ' + validLocales.join(', ') }, 400)
        }

        const service = new IdentityLeaseService(c.env.LEASE_CACHE)
        const identity = await service.createIdentity(body)

        return c.json(identity, 201)
    } catch (err: any) {
        return c.json({ error: 'Failed to create lease', details: err.message }, 500)
    }
})

router.get('/:id', async (c) => {
    const id = c.req.param('id')
    const service = new IdentityLeaseService(c.env.LEASE_CACHE)

    const identity = await service.getIdentity(id)
    if (!identity) {
        return c.json({ code: 'RESOURCE_NOT_FOUND', message: 'The identity session has expired or does not exist.' }, 404)
    }

    return c.json(identity)
})

router.delete('/:id', async (c) => {
    const id = c.req.param('id')
    const service = new IdentityLeaseService(c.env.LEASE_CACHE)

    await service.deleteIdentity(id)
    // Idempotent success
    return c.body(null, 204)
})

export { router as identityLeaseRouter }
