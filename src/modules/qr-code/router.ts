import { Hono } from 'hono'
import { QrCodeService } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

router.get('/', async (c) => {
    const text = c.req.query('text')
    const format = c.req.query('format') as 'svg' | 'png' | 'utf8' | undefined
    const margin = c.req.query('margin') ? parseInt(c.req.query('margin')!) : undefined
    const scale = c.req.query('scale') ? parseInt(c.req.query('scale')!) : undefined
    const dark = c.req.query('dark') // e.g. #000000
    const light = c.req.query('light') // e.g. #ffffff

    if (!text) {
        return c.json({ error: 'Missing "text" query parameter' }, 400)
    }

    const service = new QrCodeService()

    try {
        const result = await service.generate({
            text,
            format,
            margin,
            scale,
            color: { dark, light }
        })

        // Browser Cache: QR codes for same input never change. Cache for 1 year.
        c.header('Cache-Control', 'public, max-age=31536000, immutable')
        c.header('Content-Type', result.contentType)

        return c.body(result.data as any)
    } catch (err: any) {
        return c.json({ error: 'Failed to generate QR code', details: err.message }, 500)
    }
})

export { router as qrCodeRouter }
