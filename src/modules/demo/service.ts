import { D1Database } from '@cloudflare/workers-types'

export class DemoService {
    constructor(private db: D1Database) { }

    // --- Planets ---
    async listPlanets(page = 1, limit = 10) {
        const offset = (page - 1) * limit
        const result = await this.db.prepare(
            `SELECT * FROM galactic_planets LIMIT ? OFFSET ?`
        ).bind(limit, offset).all()
        return result.results
    }

    async getPlanet(id: number) {
        return await this.db.prepare(
            `SELECT * FROM galactic_planets WHERE id = ?`
        ).bind(id).first()
    }

    async createPlanet(data: { name: string, terrain: string, is_habitable: number }) {
        const result = await this.db.prepare(
            `INSERT INTO galactic_planets (name, terrain, is_habitable) VALUES (?, ?, ?) RETURNING *`
        ).bind(data.name, data.terrain, data.is_habitable).first()
        return result
    }

    async updatePlanet(id: number, data: { name: string, terrain: string, is_habitable: number }) {
        const result = await this.db.prepare(
            `UPDATE galactic_planets SET name = ?, terrain = ?, is_habitable = ? WHERE id = ? RETURNING *`
        ).bind(data.name, data.terrain, data.is_habitable, id).first()
        return result
    }

    async deletePlanet(id: number) {
        await this.db.prepare(`DELETE FROM galactic_planets WHERE id = ?`).bind(id).run()
    }

    // --- Species ---
    async listSpecies(planetId?: number) {
        let sql = `SELECT * FROM galactic_species`
        const params: any[] = []

        if (planetId) {
            sql += ` WHERE planet_id = ?`
            params.push(planetId)
        }

        const result = await this.db.prepare(sql).bind(...params).all()
        return result.results
    }

    // --- Starships ---
    async listStarships(minCrew?: number) {
        let sql = `SELECT * FROM galactic_starships`
        const params: any[] = []

        if (minCrew) {
            sql += ` WHERE crew >= ?`
            params.push(minCrew)
        }

        const result = await this.db.prepare(sql).bind(...params).all()
        return result.results
    }
}
