export interface Product {
    id: string
    name: string
    price: number
    stock: number
}

export interface CartItem {
    productId: string
    quantity: number
}

export interface Order {
    id: string
    status: 'confirmed' | 'failed' | 'processing'
    total: number
    createdAt: string
}

export interface ChaosStats {
    total_requests: number
    chaos_failures_triggered: number
    simulated_timeouts: number
    simulated_500s: number
    simulated_corruptions: number
}
