import { Hono } from 'hono'
import { DocsService } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

router.get('/:id', async (c) => {
    const id = c.req.param('id')
    const service = new DocsService()
    const html = await service.getDocHtml(id)

    if (!html) {
        return c.text('Documentation not found', 404)
    }

    return c.html(html)
})

export { router as docsRouter }
