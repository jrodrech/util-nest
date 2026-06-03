import { Hono } from 'hono'
import { Bindings } from '../types'
import { renderHomePage } from './pages/home'
import { renderApisPage } from './pages/apis'
const router = new Hono<{ Bindings: Bindings }>()

// Home Page
router.get('/', (c) => {
    return c.html(renderHomePage())
})

// APIs Listing
router.get('/apis', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM services').all<any>()
    return c.html(renderApisPage(results || []))
})

// Redirect old register page to new login
router.get('/register', (c) => {
    return c.redirect('/auth/login', 301)
})

// Sitemap
router.get('/sitemap.xml', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT docs_url FROM services WHERE docs_url IS NOT NULL').all<any>()
    const baseUrl = 'https://cloudflare-api-platform.jrodrech.workers.dev'

    const staticPages = ['/', '/apis', '/auth/login']
    const docPages = (results || []).map((r: any) => r.docs_url)
    const allPages = [...staticPages, ...docPages]

    const urls = allPages.map(path => `
        <url>
            <loc>${baseUrl}${path}</loc>
            <changefreq>weekly</changefreq>
            <priority>${path === '/' ? '1.0' : '0.8'}</priority>
        </url>
    `).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

    return c.text(sitemap, 200, { 'Content-Type': 'application/xml' })
})

// Robots.txt
router.get('/robots.txt', (c) => {
    const robots = `User-agent: *
Allow: /
Sitemap: https://cloudflare-api-platform.jrodrech.workers.dev/sitemap.xml`

    return c.text(robots, 200, { 'Content-Type': 'text/plain' })
})

// Postman Collection
import postmanCollection from '../postman.json'
router.get('/postman_collection.json', (c) => {
    return c.json(postmanCollection)
})

export { router as portalRouter }
