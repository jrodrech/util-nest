import { Hono } from 'hono'
import { chaosMiddleware } from './middleware'
import { ChaosShopService } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

// Apply Chaos Middleware to all routes
router.use('*', chaosMiddleware)

router.get('/products', async (c) => {
    const service = new ChaosShopService(c.env.DB)
    const products = await service.listProducts()
    return c.json(products)
})

router.post('/cart', async (c) => {
    const service = new ChaosShopService(c.env.DB)
    const body = await c.req.json()
    // Simple cart ID generation for demo (in real app, use session/cookie)
    const cartId = c.req.header('x-session-id') || 'default-session'

    const result = await service.addToCart(cartId, body.productId, body.quantity || 1)
    return c.json(result)
})

router.post('/checkout', async (c) => {
    const service = new ChaosShopService(c.env.DB)
    const cartId = c.req.header('x-session-id') || 'default-session'

    const order = await service.checkout(cartId)
    return c.json(order)
})

router.get('/stats', async (c) => {
    const service = new ChaosShopService(c.env.DB)
    const stats = await service.getStats()
    return c.json(stats)
})

export { router as chaosShopRouter }
