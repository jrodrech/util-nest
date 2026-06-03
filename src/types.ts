
import { D1Database, KVNamespace } from '@cloudflare/workers-types'

export type Bindings = {
    // Databases
    DB: D1Database

    // KV Namespaces
    PREVIEW_CACHE: KVNamespace
    LEASE_CACHE: KVNamespace
    GATEWAY_RL: KVNamespace  // Rate limiting counters

    // Secrets & Environment Variables (Kinde)
    UTILNEST_KINDE_CLIENT_ID: string
    UTILNEST_KINDE_CLIENT_SECRET: string
    UTILNEST_KINDE_ISSUER_URL: string

    // Kinde Connection IDs (Vars)
    KINDE_CONN_GOOGLE: string
    KINDE_CONN_FACEBOOK: string
    KINDE_CONN_GITHUB: string
    KINDE_CONN_MICROSOFT: string
    KINDE_CONN_APPLE: string
}

export type Variables = {
    user?: any
    startTime?: number  // Request start timestamp for latency calculation
}

export type AppContext = {
    Bindings: Bindings
    Variables: Variables
}
