import { D1Database } from '@cloudflare/workers-types'
import { HTTPException } from 'hono/http-exception'
import { Product, CartItem, Order, ChaosStats } from './types'

export class ChaosShopService {
    private db: D1Database

    constructor(db: D1Database) {
        this.db = db
    }

    async listProducts(): Promise<Product[]> {
        const { results } = await this.db.prepare('SELECT * FROM shop_products').all<Product>()
        return results
    }

    async addToCart(cartId: string, productId: string, quantity: number) {
        // Check if product exists
        const product = await this.db.prepare('SELECT * FROM shop_products WHERE id = ?').bind(productId).first<Product>()
        if (!product) {
            throw new HTTPException(404, { message: 'Product not found' })
        }

        // Ensure cart exists
        await this.db.prepare(`
      INSERT INTO shop_carts (id) VALUES (?)
      ON CONFLICT(id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    `).bind(cartId).run()

        // Add item
        await this.db.prepare(`
      INSERT INTO shop_cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
      ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = quantity + ?
    `).bind(cartId, productId, quantity, quantity).run()

        // Get cart size
        const count = await this.db.prepare('SELECT COUNT(*) as count FROM shop_cart_items WHERE cart_id = ?').bind(cartId).first<{ count: number }>()
        return { message: 'Item added', cartSize: count?.count || 0 }
    }

    async checkout(cartId: string): Promise<Order> {
        // 1. Get Cart Items
        const { results: items } = await this.db.prepare(`
      SELECT i.product_id, i.quantity, p.price, p.stock, p.name 
      FROM shop_cart_items i
      JOIN shop_products p ON i.product_id = p.id
      WHERE i.cart_id = ?
    `).bind(cartId).all<any>()

        if (items.length === 0) {
            throw new HTTPException(400, { message: 'Cart is empty' })
        }

        // 2. Calculate Total & Validate Stock
        let total = 0
        for (const item of items) {
            if (item.quantity > item.stock) {
                throw new HTTPException(409, { message: `Product ${item.name} went out of stock during checkout.` })
            }
            total += item.price * item.quantity
        }

        // 3. Create Order
        const orderId = `ord_${crypto.randomUUID().split('-')[0]}`
        await this.db.prepare(`
      INSERT INTO shop_orders (id, status, total) VALUES (?, 'confirmed', ?)
    `).bind(orderId, total).run()

        // 4. Update Stock & Clear Cart (Transaction-like)
        // Note: D1 batching is atomic
        const statements = []
        for (const item of items) {
            statements.push(
                this.db.prepare('UPDATE shop_products SET stock = stock - ? WHERE id = ?').bind(item.quantity, item.product_id)
            )
        }
        statements.push(this.db.prepare('DELETE FROM shop_cart_items WHERE cart_id = ?').bind(cartId))

        await this.db.batch(statements)

        return {
            id: orderId,
            status: 'confirmed',
            total,
            createdAt: new Date().toISOString()
        }
    }

    async getStats(): Promise<ChaosStats> {
        const { results } = await this.db.prepare('SELECT * FROM shop_stats').all<{ key: string, value: number }>()

        const stats: any = {
            total_requests: 0,
            chaos_failures_triggered: 0,
            simulated_timeouts: 0,
            simulated_500s: 0,
            simulated_corruptions: 0
        }

        for (const row of results) {
            if (row.key in stats) {
                stats[row.key] = row.value
            }
        }

        return stats
    }
}
