
/**
 * Helper to get the base URL from the request
 * @param req The incoming Request object
 * @returns The base URL (protocol + host)
 */
export function getBaseUrl(req: Request): string {
    const url = new URL(req.url)
    return `${url.protocol}//${url.host}`
}
