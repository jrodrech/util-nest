import { faker, fakerDE, fakerES, fakerFR, fakerEN_GB, fakerEN_US } from '@faker-js/faker'
import { KVNamespace } from '@cloudflare/workers-types'

export interface CreateLeaseOptions {
    locale?: 'en_US' | 'en_GB' | 'de_DE' | 'es_ES' | 'fr_FR'
    gender?: 'male' | 'female'
    ttl?: number // seconds
}

export interface IdentityProfile {
    id: string
    expiresAt: string
    personal: {
        firstName: string
        lastName: string
        email: string
        phone: string
    }
    address: {
        street: string
        city: string
        zipCode: string
        country: string
    }
    finance: {
        creditCardNumber: string
        cvv: string
        expirationDate: string
        currency: string
    }
}

export class IdentityLeaseService {
    constructor(private kv: KVNamespace) { }

    private getFakerInstance(locale: string) {
        switch (locale) {
            case 'de_DE': return fakerDE
            case 'es_ES': return fakerES
            case 'fr_FR': return fakerFR
            case 'en_GB': return fakerEN_GB
            default: return fakerEN_US
        }
    }

    async createIdentity(options: CreateLeaseOptions): Promise<IdentityProfile> {
        const locale = options.locale || 'en_US'
        const ttl = options.ttl || 900 // 15 mins
        const f = this.getFakerInstance(locale)

        const gender = options.gender ? (options.gender as any) : undefined
        const firstName = f.person.firstName(gender)
        const lastName = f.person.lastName(gender)

        // Ensure email is safe
        const email = f.internet.email({ firstName, lastName, provider: 'example.com' })

        const id = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()

        const identity: IdentityProfile = {
            id,
            expiresAt,
            personal: {
                firstName,
                lastName,
                email,
                phone: f.phone.number(),
            },
            address: {
                street: f.location.streetAddress(),
                city: f.location.city(),
                zipCode: f.location.zipCode(),
                country: f.location.country(),
            },
            finance: {
                creditCardNumber: f.finance.creditCardNumber({ issuer: 'visa' }), // Luhn valid by default in faker
                cvv: f.finance.creditCardCVV(),
                expirationDate: this.generateExpirationDate(),
                currency: f.finance.currencyCode(),
            },
        }

        // Store in KV
        await this.kv.put(id, JSON.stringify(identity), { expirationTtl: ttl })

        return identity
    }

    async getIdentity(id: string): Promise<IdentityProfile | null> {
        const data = await this.kv.get(id)
        if (!data) return null
        return JSON.parse(data) as IdentityProfile
    }

    async deleteIdentity(id: string): Promise<void> {
        await this.kv.delete(id)
    }

    private generateExpirationDate(): string {
        const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1
        const month = Math.floor(Math.random() * 12) + 1
        return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
    }
}
