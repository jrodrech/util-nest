import { Hono } from 'hono'
import { YouTubeService } from './service'
import { Bindings } from '../../types'

const router = new Hono<{ Bindings: Bindings }>()

router.get('/info', async (c) => {
    const url = c.req.query('url')
    if (!url) return c.json({ error: 'Missing url parameter' }, 400)

    const service = new YouTubeService()
    const videoId = service.extractVideoId(url)

    if (!videoId) return c.json({ error: 'Invalid YouTube URL' }, 400)

    try {
        const info = await service.getVideoInfo(videoId)
        return c.json(info)
    } catch (e: any) {
        return c.json({ error: e.message }, 404)
    }
})

router.get('/transcript', async (c) => {
    const url = c.req.query('url')
    if (!url) return c.json({ error: 'Missing url parameter' }, 400)

    const service = new YouTubeService()
    const videoId = service.extractVideoId(url)

    if (!videoId) return c.json({ error: 'Invalid YouTube URL' }, 400)

    try {
        const transcript = await service.getTranscript(videoId)
        return c.json(transcript)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

router.get('/audio', async (c) => {
    const url = c.req.query('url')
    if (!url) return c.json({ error: 'Missing url parameter' }, 400)

    const service = new YouTubeService()
    const videoId = service.extractVideoId(url)

    if (!videoId) return c.json({ error: 'Invalid YouTube URL' }, 400)

    try {
        const audio = await service.getAudioStream(videoId)

        // Return 302 Found redirect to the actual audio stream
        // This saves bandwidth/CPU on our worker
        return c.redirect(audio.url)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

export { router as youtubeRouter }
