import { describe, it, expect } from 'vitest'
import { ChaosEngine } from '../../src/modules/chaos-shop/middleware'

describe('ChaosEngine', () => {
    it('should pass through when chaos level is 0', async () => {
        const engine = new ChaosEngine()
        const p = engine.shouldFail(0)
        expect(p).toBe(false)
    })

    it('should always fail when chaos level is 100', async () => {
        const engine = new ChaosEngine()
        const p = engine.shouldFail(100)
        expect(p).toBe(true)
    })

    it('should determine a failure mode', () => {
        const engine = new ChaosEngine()
        const mode = engine.determineFailureMode()
        expect(['latency', '5xx', 'corruption', 'soft']).toContain(mode)
    })
})
