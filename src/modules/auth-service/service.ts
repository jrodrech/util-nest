/**
 * Authentication Service - Public Utility API
 * Provides JWT generation/validation and password hashing for developers
 */

// Simple base64url encoder/decoder for JWT
function base64urlEncode(data: string): string {
    return btoa(data)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

function base64urlDecode(data: string): string {
    const padded = data + '='.repeat((4 - data.length % 4) % 4)
    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
}

export class AuthServiceService {
    private signingSecret: string

    constructor(apiKeyPrefix: string) {
        // Derive a unique signing secret from the API key prefix
        // This ensures tokens from one user can't be validated by another
        this.signingSecret = `utilnest_jwt_secret_${apiKeyPrefix}`
    }

    /**
     * Generate a signed JWT token
     */
    async generateToken(payload: Record<string, any>, expiresInSeconds: number = 3600): Promise<{ token: string, expiresAt: string }> {
        const now = Math.floor(Date.now() / 1000)
        const exp = now + expiresInSeconds

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        }

        const fullPayload = {
            ...payload,
            iat: now,
            exp: exp,
            iss: 'utilnest'
        }

        const headerB64 = base64urlEncode(JSON.stringify(header))
        const payloadB64 = base64urlEncode(JSON.stringify(fullPayload))
        const dataToSign = `${headerB64}.${payloadB64}`

        // Sign with HMAC-SHA256
        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(this.signingSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        )

        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(dataToSign)
        )

        const signatureB64 = base64urlEncode(
            String.fromCharCode(...new Uint8Array(signature))
        )

        const token = `${dataToSign}.${signatureB64}`
        const expiresAt = new Date(exp * 1000).toISOString()

        return { token, expiresAt }
    }

    /**
     * Validate a JWT token and return its payload
     */
    async validateToken(token: string): Promise<{ valid: boolean, payload?: Record<string, any>, error?: string }> {
        try {
            const parts = token.split('.')
            if (parts.length !== 3) {
                return { valid: false, error: 'Invalid token format' }
            }

            const [headerB64, payloadB64, signatureB64] = parts

            // Verify signature
            const dataToVerify = `${headerB64}.${payloadB64}`
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(this.signingSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            )

            // Decode signature
            const signatureChars = base64urlDecode(signatureB64)
            const signatureBytes = new Uint8Array(signatureChars.length)
            for (let i = 0; i < signatureChars.length; i++) {
                signatureBytes[i] = signatureChars.charCodeAt(i)
            }

            const isValid = await crypto.subtle.verify(
                'HMAC',
                key,
                signatureBytes,
                encoder.encode(dataToVerify)
            )

            if (!isValid) {
                return { valid: false, error: 'Invalid signature' }
            }

            // Decode payload
            const payload = JSON.parse(base64urlDecode(payloadB64))

            // Check expiration
            const now = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp < now) {
                return { valid: false, error: 'Token expired' }
            }

            return { valid: true, payload }
        } catch (e) {
            return { valid: false, error: 'Token validation failed' }
        }
    }

    /**
     * Hash a password securely using SHA-256 with salt
     */
    async hashPassword(password: string): Promise<{ hash: string, algorithm: string }> {
        // Generate random salt
        const salt = new Uint8Array(16)
        crypto.getRandomValues(salt)
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')

        // Hash password with salt
        const encoder = new TextEncoder()
        const data = encoder.encode(saltHex + password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        // Format: $utilnest$v1$<salt>$<hash>
        const hash = `$utilnest$v1$${saltHex}$${hashHex}`

        return { hash, algorithm: 'SHA-256 with salt' }
    }

    /**
     * Verify a password against a stored hash
     */
    async verifyPassword(password: string, storedHash: string): Promise<{ match: boolean }> {
        try {
            // Parse stored hash
            const parts = storedHash.split('$')
            if (parts.length !== 5 || parts[1] !== 'utilnest' || parts[2] !== 'v1') {
                return { match: false }
            }

            const salt = parts[3]
            const expectedHash = parts[4]

            // Recompute hash
            const encoder = new TextEncoder()
            const data = encoder.encode(salt + password)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const computedHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')

            return { match: computedHash === expectedHash }
        } catch (e) {
            return { match: false }
        }
    }
}
