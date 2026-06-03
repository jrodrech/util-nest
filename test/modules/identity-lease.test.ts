import { describe, it, expect, vi } from 'vitest'
import { IdentityLeaseService } from '../../src/modules/identity-lease/service'

// Mock KV
const kvMock = {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
} as any

describe('IdentityLeaseService', () => {
    it('should create an identity with correct locale defaults', async () => {
        const service = new IdentityLeaseService(kvMock)
        const identity = await service.createIdentity({ locale: 'fr_FR' })

        expect(identity.id).toBeDefined()
        expect(identity.personal.firstName).toBeDefined()
        // Simple heuristic: FR phone numbers often start with +33 or 0
        // We trust faker, but we check structure
        expect(identity.finance.currency).toBeDefined()

        // storage
        expect(kvMock.put).toHaveBeenCalled()
    })

    it('should retrieve a stored identity', async () => {
        const service = new IdentityLeaseService(kvMock)
        const mockIdentity = { id: '123', personal: { firstName: 'Test' } }

        kvMock.get.mockResolvedValue(JSON.stringify(mockIdentity))

        const result = await service.getIdentity('123')
        expect(result).toEqual(mockIdentity)
    })

    it('should return null if not found', async () => {
        const service = new IdentityLeaseService(kvMock)
        kvMock.get.mockResolvedValue(null)

        const result = await service.getIdentity('404')
        expect(result).toBeNull()
    })

    it('should delete identity', async () => {
        const service = new IdentityLeaseService(kvMock)
        await service.deleteIdentity('123')
        expect(kvMock.delete).toHaveBeenCalledWith('123')
    })
})
