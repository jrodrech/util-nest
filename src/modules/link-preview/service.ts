import { load } from 'cheerio'
import { HTTPException } from 'hono/http-exception'
import { KVNamespace } from '@cloudflare/workers-types'

interface LinkMetadata {
    url: string
    title: string
    description: string
    image: string
    siteName: string
    favicon: string
    mediaType: string
}

const TIMEOUT_MS = 5000

export class LinkPreviewService {
    private kv: KVNamespace | null

    constructor(kv: KVNamespace | null = null) {
        this.kv = kv
    }

    async getMetadata(targetUrl: string): Promise<LinkMetadata> {
        this.validateUrl(targetUrl)

        if (this.kv) {
            const cached = await this.kv.get(targetUrl, 'json') as LinkMetadata | null
            if (cached) return cached
        }

        try {
            const html = await this.fetchUrl(targetUrl)
            const metadata = this.parseHtml(html, targetUrl)

            if (this.kv && metadata.title) {
                // Cache successful results for 1 hour
                await this.kv.put(targetUrl, JSON.stringify(metadata), { expirationTtl: 3600 })
            }

            return metadata
        } catch (e: any) {
            // Fallback for blocked/unreachable sites
            // 424 = Failed Dependency (we use this for blocked requests)
            // 403 = Forbidden
            // 502 = Bad Gateway (upstream error)
            if (e instanceof HTTPException && (e.status === 424 || e.status === 429 || e.status === 403 || e.status === 502)) {
                console.warn(`Fallback used for ${targetUrl}: ${e.message}`)
                return this.generateBasicMetadata(targetUrl)
            }
            throw e
        }
    }

    private generateBasicMetadata(url: string): LinkMetadata {
        try {
            const u = new URL(url)
            return {
                url: url,
                title: u.hostname,
                description: `Preview unavailable for ${u.hostname}`,
                image: '',
                siteName: u.hostname,
                favicon: `${u.protocol}//${u.hostname}/favicon.ico`,
                mediaType: 'website'
            }
        } catch {
            return {
                url: url,
                title: 'Link Preview',
                description: 'Preview unavailable',
                image: '',
                siteName: '',
                favicon: '',
                mediaType: 'website'
            }
        }
    }

    private validateUrl(url: string) {
        try {
            const u = new URL(url)
            // Basic SSRF protection
            if (
                u.hostname === 'localhost' ||
                u.hostname === '127.0.0.1' ||
                u.hostname.startsWith('192.168.') ||
                u.hostname.startsWith('10.')
            ) {
                throw new HTTPException(422, { message: 'Use of private network is not allowed' })
            }
        } catch (e) {
            if (e instanceof HTTPException) throw e
            throw new HTTPException(400, { message: 'Invalid URL provided' })
        }
    }

    private async fetchUrl(url: string): Promise<string> {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                    'Referer': 'https://www.google.com/'
                },
                signal: controller.signal,
            })
            clearTimeout(id)

            if (!res.ok) {
                // Special handling for rate limits / bot detection
                if (res.status === 429) {
                    throw new HTTPException(424, { message: 'Target blocked request (Rate Limit/Bot Protection)' })
                }

                throw new HTTPException(res.status === 404 ? 404 : 502, {
                    message: `Failed to fetch URL: ${res.statusText}`,
                })
            }

            const contentType = res.headers.get('content-type') || ''
            if (!contentType.includes('text/html')) {
                throw new HTTPException(422, { message: 'Target URL is not an HTML page' })
            }

            return await res.text()
        } catch (err: any) {
            clearTimeout(id)
            if (err.name === 'AbortError') {
                throw new HTTPException(504, { message: 'Request timed out' })
            }
            throw err
        }
    }

    private parseHtml(html: string, originalUrl: string): LinkMetadata {
        const $ = load(html)

        // Helper to get content from meta tags
        const getMeta = (selectors: string[]) => {
            for (const s of selectors) {
                const val = $(s).attr('content') || $(s).text()
                if (val) return val.trim()
            }
            return ''
        }

        // Title Logic: og:title -> twitter:title -> <title>
        const title = getMeta([
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            'title'
        ])

        // Description Logic: og:description -> twitter:description -> meta[description] -> p
        let description = getMeta([
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            'meta[name="description"]'
        ])
        if (!description) {
            description = $('p').first().text().substring(0, 150)
        }

        // Image Logic: og:image -> twitter:image
        const image = getMeta([
            'meta[property="og:image"]',
            'meta[name="twitter:image"]'
        ])

        // Other metadata
        const siteName = getMeta(['meta[property="og:site_name"]'])
        const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href') || ''
        const mediaType = getMeta(['meta[property="og:type"]']) || 'website'

        // Resolve relative URLs for image/favicon
        const resolveUrl = (path: string) => {
            if (!path) return ''
            try { return new URL(path, originalUrl).href } catch { return path }
        }

        return {
            url: originalUrl,
            title: title || '',
            description: description || '',
            image: resolveUrl(image),
            siteName: siteName || '',
            favicon: resolveUrl(favicon),
            mediaType
        }
    }
}
