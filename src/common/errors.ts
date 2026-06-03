import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export function handleError(err: Error, c: Context) {
    console.error(err)
    if (err instanceof HTTPException) {
        return err.getResponse()
    }
    return c.json({
        error: err.message || 'Internal Server Error',
        code: 500
    }, 500)
}

export class AppError extends Error {
    code: number
    constructor(message: string, code = 500) {
        super(message)
        this.code = code
    }
}
