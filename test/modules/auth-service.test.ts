import { describe, it, expect, beforeEach } from 'vitest'
import { AuthServiceService } from '../../src/modules/auth-service/service'

describe('AuthServiceService', () => {
    let service: AuthServiceService

    beforeEach(() => {
        service = new AuthServiceService('sk_live_test')
    })

    describe('JWT Tokens', () => {
        it('should generate a valid JWT token', async () => {
            const { token, expiresAt } = await service.generateToken({ userId: 'user_123' }, 3600)

            expect(token).toBeDefined()
            expect(token.split('.').length).toBe(3) // header.payload.signature
            expect(expiresAt).toBeDefined()
            expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now())
        })

        it('should validate a token it generated', async () => {
            const { token } = await service.generateToken({ userId: 'user_123', role: 'admin' }, 3600)
            const result = await service.validateToken(token)

            expect(result.valid).toBe(true)
            expect(result.payload?.userId).toBe('user_123')
            expect(result.payload?.role).toBe('admin')
            expect(result.payload?.iss).toBe('utilnest')
        })

        it('should reject a token from a different signing secret', async () => {
            const service1 = new AuthServiceService('key_1')
            const service2 = new AuthServiceService('key_2')

            const { token } = await service1.generateToken({ userId: 'user_123' }, 3600)
            const result = await service2.validateToken(token)

            expect(result.valid).toBe(false)
            expect(result.error).toBe('Invalid signature')
        })

        it('should reject an invalid token format', async () => {
            const result = await service.validateToken('not.a.valid.token')
            expect(result.valid).toBe(false)
        })

        it('should reject a tampered token', async () => {
            const { token } = await service.generateToken({ userId: 'user_123' }, 3600)
            const tamperedToken = token.slice(0, -5) + 'XXXXX'
            const result = await service.validateToken(tamperedToken)

            expect(result.valid).toBe(false)
        })
    })

    describe('Password Hashing', () => {
        it('should hash a password', async () => {
            const { hash, algorithm } = await service.hashPassword('mySecurePassword123')

            expect(hash).toBeDefined()
            expect(hash.startsWith('$utilnest$v1$')).toBe(true)
            expect(algorithm).toBe('SHA-256 with salt')
        })

        it('should generate different hashes for the same password (salted)', async () => {
            const { hash: hash1 } = await service.hashPassword('samePassword')
            const { hash: hash2 } = await service.hashPassword('samePassword')

            expect(hash1).not.toBe(hash2) // Different salts
        })

        it('should verify a correct password', async () => {
            const password = 'mySecurePassword123'
            const { hash } = await service.hashPassword(password)
            const { match } = await service.verifyPassword(password, hash)

            expect(match).toBe(true)
        })

        it('should reject an incorrect password', async () => {
            const { hash } = await service.hashPassword('correctPassword')
            const { match } = await service.verifyPassword('wrongPassword', hash)

            expect(match).toBe(false)
        })

        it('should reject an invalid hash format', async () => {
            const { match } = await service.verifyPassword('password', 'invalid_hash')
            expect(match).toBe(false)
        })
    })
})
