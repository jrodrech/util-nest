import { describe, it, expect, beforeAll } from 'vitest'

// Run against the deployed environment
const BASE_URL = 'https://cloudflare-api-platform.jrodrech.workers.dev'
const AUTH_SERVICE_URL = `${BASE_URL}/api/v1/auth-service`

describe('E2E: Authentication Service', () => {
    let apiKey: string

    beforeAll(async () => {
        // Create a new key for this test run
        const res = await fetch(`${BASE_URL}/api/v1/auth/keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: 'E2E-AuthService' })
        })
        const data = await res.json()
        apiKey = data.key
        console.log('E2E Test Key:', apiKey ? 'Created' : 'Failed')
    })

    it('should generate and validate a JWT token', async () => {
        // 1. Generate
        const genRes = await fetch(`${AUTH_SERVICE_URL}/tokens/generate`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: { sub: 'user_123' }, expiresIn: 60 })
        })
        expect(genRes.status).toBe(201)
        const tokenData = await genRes.json()
        expect(tokenData.token).toBeDefined()

        // 2. Validate
        const valRes = await fetch(`${AUTH_SERVICE_URL}/tokens/validate`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenData.token })
        })
        expect(valRes.status).toBe(200)
        const valData = await valRes.json()
        expect(valData.valid).toBe(true)
        expect(valData.payload.sub).toBe('user_123')
    })

    it('should hash and verify a password', async () => {
        const password = 'mySuperSecretPassword'

        // 1. Hash
        const hashRes = await fetch(`${AUTH_SERVICE_URL}/passwords/hash`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })
        expect(hashRes.status).toBe(201)
        const hashData = await hashRes.json()
        expect(hashData.hash).toContain('$utilnest$v1$')

        // 2. Verify Correct
        const verifyRes = await fetch(`${AUTH_SERVICE_URL}/passwords/verify`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, hash: hashData.hash })
        })
        expect(verifyRes.status).toBe(200)
        const verifyData = await verifyRes.json()
        expect(verifyData.match).toBe(true)

        // 3. Verify Incorrect
        const wrongRes = await fetch(`${AUTH_SERVICE_URL}/passwords/verify`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'wrong', hash: hashData.hash })
        })
        expect(wrongRes.status).toBe(200)
        const wrongData = await wrongRes.json()
        expect(wrongData.match).toBe(false)
    })
})
