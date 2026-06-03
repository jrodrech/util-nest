import { D1Database } from '@cloudflare/workers-types'

export interface ApiKeyRecord {
    id: string
    prefix: string
    owner: string
    permissions: string[]
    is_active: boolean
    created_at: string
}

export class AuthService {
    constructor(private db: D1Database) { }

    /**
     * Generates a new API Key and stores its hash.
     * Returns the raw key (only time it's seen).
     * @param owner - Display name for the key
     * @param permissions - Array of permission scopes
     * @param userId - Optional Kinde user ID (for authenticated users)
     */
    async createKey(owner: string, permissions: string[] = [], userId?: string): Promise<{ key: string, prefix: string }> {
        // Generate random key: sk_live_<32_random_hex>
        const randomBytes = new Uint8Array(24)
        crypto.getRandomValues(randomBytes)
        const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
        const key = `sk_live_${randomHex}`
        const prefix = key.substring(0, 12) // sk_live_abcd

        // Hash the key
        const keyHash = await this.hashKey(key)

        // Store in DB
        const id = crypto.randomUUID()
        await this.db.prepare(`
            INSERT INTO api_keys (id, key_hash, prefix, owner, user_id, permissions)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(id, keyHash, prefix, owner, userId || null, JSON.stringify(permissions)).run()

        return { key, prefix }
    }

    /**
     * Validates an API Key.
     * Returns the key record if valid, null otherwise.
     */
    async validateKey(key: string): Promise<ApiKeyRecord | null> {
        if (!key.startsWith('sk_live_')) return null

        const prefix = key.substring(0, 12)
        const keyHash = await this.hashKey(key)

        // Lookup by prefix first (optimization)
        const result = await this.db.prepare(`
            SELECT * FROM api_keys 
            WHERE prefix = ?
        `).bind(prefix).all<any>()

        if (!result.results || result.results.length === 0) return null

        // Find matching hash and active status
        const match = result.results.find(r => r.key_hash === keyHash && r.is_active)

        if (!match) return null

        return {
            id: match.id,
            prefix: match.prefix,
            owner: match.owner,
            permissions: JSON.parse(match.permissions),
            is_active: Boolean(match.is_active),
            created_at: match.created_at
        }
    }

    async revokeKey(prefix: string): Promise<boolean> {
        const res = await this.db.prepare(`
            UPDATE api_keys SET is_active = 0 WHERE prefix = ?
        `).bind(prefix).run()
        return res.meta.changes > 0
    }

    private async hashKey(key: string): Promise<string> {
        const msgBuffer = new TextEncoder().encode(key)
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
}
