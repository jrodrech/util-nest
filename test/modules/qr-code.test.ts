import { describe, it, expect } from 'vitest'
import { QrCodeService } from '../../src/modules/qr-code/service'

describe('QrCodeService', () => {
    const service = new QrCodeService()

    it('should generate SVG by default', async () => {
        const result = await service.generate({ text: 'test' })
        expect(result.contentType).toBe('image/svg+xml')
        // Check if it looks like an SVG
        // NOTE: We cast to string because we know it's a string, though interface says string | Buffer
        expect(result.data.toString()).toContain('<svg')
        expect(result.data.toString()).toContain('</svg>')
    })

    it('should generate UTF8 text format', async () => {
        const result = await service.generate({ text: 'test', format: 'utf8' })
        expect(result.contentType).toBe('text/plain')
        expect(typeof result.data).toBe('string')
    })

    it('should throw error for PNG format', async () => {
        // We expect this to fail now
        await expect(service.generate({ text: 'test', format: 'png' as any })).rejects.toThrow('PNG format is not supported')
    })
})
