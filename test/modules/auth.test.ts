import { describe, it, expect, vi } from 'vitest'
import { AuthService } from '../../src/modules/auth/service'

// Mock D1
const dbMock = {
    prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            all: vi.fn().mockResolvedValue({ results: [] }),
            first: vi.fn()
        }))
    }))
} as any

describe('AuthService', () => {
    it('should create and validate a key', async () => {
        const service = new AuthService(dbMock)

        // 1. Create
        const { key, prefix } = await service.createKey('TestUser', ['read'])
        expect(key).toMatch(/^sk_live_[a-f0-9]{48}$/)
        expect(prefix).toBe(key.substring(0, 12))

        // Capture the hash that was stored
        const insertCall = dbMock.prepare.mock.results[0].value.bind.mock.calls[0]
        const storedHash = insertCall[1]

        // 2. Mock the lookup for validation
        dbMock.prepare.mockImplementation(() => ({
            bind: vi.fn(() => ({
                all: vi.fn().mockResolvedValue({
                    results: [{
                        id: '123',
                        key_hash: storedHash,
                        prefix,
                        owner: 'TestUser',
                        permissions: '["read"]',
                        is_active: 1
                    }]
                })
            }))
        }))

        // 3. Validate
        const valid = await service.validateKey(key)
        expect(valid).not.toBeNull()
        expect(valid?.owner).toBe('TestUser')
    })

    it('should fail if prefix matches but hash does not', async () => {
        const service = new AuthService(dbMock)
        const key = 'sk_live_123456789012_fake_suffix'

        dbMock.prepare.mockImplementation(() => ({
            bind: vi.fn(() => ({
                all: vi.fn().mockResolvedValue({
                    results: [{
                        key_hash: 'different_hash',
                        prefix: 'sk_live_1234'
                    }]
                })
            }))
        }))

        const valid = await service.validateKey(key)
        expect(valid).toBeNull()
    })
})
