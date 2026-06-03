import { Hono } from 'hono'
import { DemoService } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

// --- Planets ---
router.get('/planets', async (c) => {
    const service = new DemoService(c.env.DB)
    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 10
    const results = await service.listPlanets(page, limit)

    // Pagination meta (simplified for demo)
    return c.json({
        data: results,
        meta: { page, limit }
    })
})

router.get('/planets/:id', async (c) => {
    const service = new DemoService(c.env.DB)
    const id = Number(c.req.param('id'))
    const result = await service.getPlanet(id)

    if (!result) return c.json({ error: 'Planet not found', code: 'RESOURCE_NOT_FOUND' }, 404)
    return c.json(result)
})

router.post('/planets', async (c) => {
    const service = new DemoService(c.env.DB)
    const body = await c.req.json().catch(() => ({}))

    // Simple Validation
    if (!body.name || !body.terrain) {
        return c.json({ error: 'Validation Failed', details: 'name and terrain are required' }, 422)
    }

    const result = await service.createPlanet({
        name: body.name,
        terrain: body.terrain,
        is_habitable: body.is_habitable ? 1 : 0
    })

    return c.json(result, 201)
})

router.put('/planets/:id', async (c) => {
    const service = new DemoService(c.env.DB)
    const id = Number(c.req.param('id'))
    const body = await c.req.json()

    const result = await service.updatePlanet(id, {
        name: body.name,
        terrain: body.terrain,
        is_habitable: body.is_habitable ? 1 : 0
    })

    if (!result) return c.json({ error: 'Planet not found' }, 404)
    return c.json(result)
})

router.delete('/planets/:id', async (c) => {
    const service = new DemoService(c.env.DB)
    const id = Number(c.req.param('id'))
    await service.deletePlanet(id)
    return c.json({ message: 'Planet deleted' }) // 200 OK
})

// --- Species ---
router.get('/species', async (c) => {
    const service = new DemoService(c.env.DB)
    const planetId = c.req.query('planet_id') ? Number(c.req.query('planet_id')) : undefined
    const results = await service.listSpecies(planetId)
    return c.json({ data: results })
})

// --- Starships ---
router.get('/starships', async (c) => {
    const service = new DemoService(c.env.DB)
    const minCrew = c.req.query('min_crew') ? Number(c.req.query('min_crew')) : undefined
    const results = await service.listStarships(minCrew)
    return c.json({ data: results })
})

// --- Error Lab ---
router.get('/errors/:status', (c) => {
    const status = Number(c.req.param('status')) as any
    const message = c.req.query('message') || 'Simulated Error'

    // Simulate specific status codes
    if ([400, 401, 403, 404, 418, 500, 503].includes(status)) {
        return c.json({ error: true, status, message }, status)
    }

    return c.json({ error: 'Unsupported status code for simulation' }, 400)
})

export { router as demoRouter }
