import { describe, it, expect } from 'vitest'

const BASE_URL = 'https://cloudflare-api-platform.jrodrech.workers.dev'

describe('E2E Production Tests', () => {

    it('Health Check', async () => {
        const res = await fetch(`${BASE_URL}/api/health`)
        expect(res.status).toBe(200)
        const data = await res.json() as any
        expect(data.status).toBe('ok')
    })

    it('List Services', async () => {
        const res = await fetch(`${BASE_URL}/api/services`)
        expect(res.status).toBe(200)
        const data = await res.json() as any
        expect(Array.isArray(data.services)).toBe(true)
        expect(data.services.length).toBeGreaterThanOrEqual(5)
    })

    it('Link Preview (GitHub)', async () => {
        const res = await fetch(`${BASE_URL}/api/v1/link-preview?url=https://github.com`)
        expect(res.status).toBe(200)
        const data = await res.json() as any
        expect(data.title).toContain('GitHub')
    })

    it('Chaos Shop (Products)', async () => {
        const res = await fetch(`${BASE_URL}/api/v1/shop/products`)
        expect(res.status).toBe(200)
        const data = await res.json() as any
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)
    })

    it('QR Code (SVG)', async () => {
        const res = await fetch(`${BASE_URL}/api/v1/qrcode?text=E2E_Test`)
        expect(res.status).toBe(200)
        expect(res.headers.get('content-type')).toContain('image/svg+xml')
        const text = await res.text()
        expect(text).toContain('<svg')
    })

    describe('Identity Lease Flow', () => {
        let leaseId: string

        it('Create Lease', async () => {
            const res = await fetch(`${BASE_URL}/api/v1/leases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale: 'en_US', ttl: 60 })
            })
            expect(res.status).toBe(201)
            const data = await res.json() as any
            leaseId = data.id
            expect(leaseId).toBeDefined()
            expect(data.personal.firstName).toBeDefined()
        })

        it('Get Lease', async () => {
            expect(leaseId).toBeDefined()
            const res = await fetch(`${BASE_URL}/api/v1/leases/${leaseId}`)
            expect(res.status).toBe(200)
            const data = await res.json() as any
            expect(data.id).toBe(leaseId)
        })

        it('Delete Lease', async () => {
            expect(leaseId).toBeDefined()
            const res = await fetch(`${BASE_URL}/api/v1/leases/${leaseId}`, {
                method: 'DELETE'
            })
            expect(res.status).toBe(204)
        })

        it('Verify Deletion', async () => {
            expect(leaseId).toBeDefined()
            const res = await fetch(`${BASE_URL}/api/v1/leases/${leaseId}`)
            expect(res.status).toBe(404)
        })
    })
})
