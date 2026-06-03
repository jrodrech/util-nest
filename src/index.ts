import { Hono } from 'hono'
import { handleError } from './common/errors'
import { Bindings } from './types'
import previewRouter from './modules/link-preview/router'
import { chaosShopRouter } from './modules/chaos-shop/router'
import { docsRouter } from './modules/docs/router'
import { qrCodeRouter } from './modules/qr-code/router'
import { identityLeaseRouter } from './modules/identity-lease/router'
import { authRouter } from './modules/auth/router'
import { authMiddleware } from './modules/auth/middleware'
import { gatewayMiddleware } from './common/middleware/gateway'
import { authServiceRouter } from './modules/auth-service/router'
import { demoRouter } from './modules/demo/router'
import { youtubeRouter } from './modules/youtube/router'
import { userAuthRouter } from './modules/user-auth/router'
import { portalRouter } from './portal/router'

const app = new Hono<{ Bindings: Bindings }>()

// Global Error Handler
app.onError((err, c) => {
  return handleError(err, c)
})

// Portal routes (public)
app.route('/', portalRouter)

// User Authentication routes (public - OAuth flow)
app.route('/auth', userAuthRouter)

// Global Middleware (protects /api/v1/*)
// Order: Auth first (validates key), then Gateway (rate limits & tracks)
app.use('/api/v1/*', authMiddleware)
app.use('/api/v1/*', gatewayMiddleware)

app.route('/api/v1/auth', authRouter)
app.route('/api/v1/auth-service', authServiceRouter)
app.route('/api/v1/demo', demoRouter)
app.route('/api/v1/youtube', youtubeRouter)
app.route('/api/v1/link-preview', previewRouter)
app.route('/api/v1/shop', chaosShopRouter)
app.route('/api/v1/qrcode', qrCodeRouter)
app.route('/api/v1/leases', identityLeaseRouter)
app.route('/docs', docsRouter)

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/services', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM services').all()
  return c.json({ services: results })
})

export default app
