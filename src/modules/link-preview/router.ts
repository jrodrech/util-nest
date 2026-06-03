import { Hono } from 'hono'
import { LinkPreviewService } from './service'
import { handleError } from '../../common/errors'
import { Bindings } from '../../types'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
    const url = c.req.query('url')
    if (!url) {
        return c.json({ error: 'URL parameter is required', code: 400 }, 400)
    }

    try {
        const service = new LinkPreviewService(c.env.PREVIEW_CACHE)
        const metadata = await service.getMetadata(url)
        return c.json(metadata)
    } catch (err: any) {
        return handleError(err, c)
    }
})

export default app
