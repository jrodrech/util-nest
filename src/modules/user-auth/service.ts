/**
 * User Authentication Service
 * Handles OAuth 2.0 Authorization Code Flow with Kinde
 * and JWT validation using JWKS
 */

interface KindeConfig {
    clientId: string
    clientSecret: string
    issuerUrl: string
    redirectUri: string
}

interface JWK {
    kty: string
    use: string
    kid: string
    alg: string
    n: string
    e: string
}

interface JWKS {
    keys: JWK[]
}

interface TokenResponse {
    access_token: string
    id_token: string
    token_type: string
    expires_in: number
}

interface UserInfo {
    sub: string  // Kinde user ID
    email?: string
    given_name?: string
    family_name?: string
    roles?: string[]  // Roles from Kinde
}

export class UserAuthService {
    private config: KindeConfig
    private jwksCache: JWKS | null = null
    private jwksCacheTime: number = 0
    private readonly JWKS_CACHE_TTL = 3600000 // 1 hour

    constructor(config: KindeConfig) {
        this.config = config
    }

    /**
     * Generate the Kinde login URL
     * This is where users are redirected to login
     */
    getLoginUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: 'openid profile email',
            state: state
        })
        return `${this.config.issuerUrl}/oauth2/auth?${params.toString()}`
    }

    /**
     * Generate the Kinde logout URL
     */
    getLogoutUrl(returnTo: string): string {
        const params = new URLSearchParams({
            redirect: returnTo
        })
        return `${this.config.issuerUrl}/logout?${params.toString()}`
    }

    /**
     * Exchange authorization code for tokens
     * This happens after the user logs in and is redirected back
     */
    async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
        const tokenUrl = `${this.config.issuerUrl}/oauth2/token`

        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            code: code,
            redirect_uri: this.config.redirectUri
        })

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Token exchange failed: ${error}`)
        }

        return await response.json() as TokenResponse
    }

    /**
     * Fetch the JSON Web Key Set from Kinde
     * These are the public keys used to verify JWT signatures
     */
    private async fetchJWKS(): Promise<JWKS> {
        // Return cached if still valid
        if (this.jwksCache && Date.now() - this.jwksCacheTime < this.JWKS_CACHE_TTL) {
            return this.jwksCache
        }

        const jwksUrl = `${this.config.issuerUrl}/.well-known/jwks.json`
        const response = await fetch(jwksUrl)

        if (!response.ok) {
            throw new Error('Failed to fetch JWKS')
        }

        this.jwksCache = await response.json() as JWKS
        this.jwksCacheTime = Date.now()
        return this.jwksCache
    }

    /**
     * Convert a JWK to a CryptoKey for verification
     */
    private async importJWK(jwk: JWK): Promise<CryptoKey> {
        return await crypto.subtle.importKey(
            'jwk',
            {
                kty: jwk.kty,
                n: jwk.n,
                e: jwk.e,
                alg: jwk.alg,
                use: jwk.use
            },
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256'
            },
            false,
            ['verify']
        )
    }

    /**
     * Base64URL decode (JWT uses URL-safe base64)
     */
    private base64UrlDecode(str: string): Uint8Array {
        // Add padding if needed
        const padding = '='.repeat((4 - str.length % 4) % 4)
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes
    }

    /**
     * Validate a JWT access token
     * Returns the decoded payload if valid, null if invalid
     */
    async validateToken(token: string): Promise<UserInfo | null> {
        try {
            const parts = token.split('.')
            if (parts.length !== 3) return null

            const [headerB64, payloadB64, signatureB64] = parts

            // Decode header to get key ID
            const headerJson = new TextDecoder().decode(this.base64UrlDecode(headerB64))
            const header = JSON.parse(headerJson)

            // Fetch JWKS and find matching key
            const jwks = await this.fetchJWKS()
            const jwk = jwks.keys.find(k => k.kid === header.kid)
            if (!jwk) {
                console.error('No matching JWK found for kid:', header.kid)
                return null
            }

            // Import the key
            const cryptoKey = await this.importJWK(jwk)

            // Verify signature
            const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
            const signature = this.base64UrlDecode(signatureB64)

            const isValid = await crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                cryptoKey,
                signature,
                data
            )

            if (!isValid) {
                console.error('JWT signature verification failed')
                return null
            }

            // Decode and validate payload
            const payloadJson = new TextDecoder().decode(this.base64UrlDecode(payloadB64))
            const payload = JSON.parse(payloadJson)

            // Check expiration
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                console.error('Token expired')
                return null
            }

            // Check issuer
            if (payload.iss !== this.config.issuerUrl) {
                console.error('Invalid issuer')
                return null
            }

            return {
                sub: payload.sub,
                email: payload.email,
                given_name: payload.given_name,
                family_name: payload.family_name,
                roles: payload.roles || []
            }
        } catch (e) {
            console.error('Token validation error:', e)
            return null
        }
    }
}
