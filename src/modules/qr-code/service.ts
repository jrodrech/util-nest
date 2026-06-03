import QRCode from 'qrcode'

export interface QrCodeOptions {
    text: string
    format?: 'svg' | 'png' | 'utf8'
    margin?: number
    scale?: number
    color?: {
        dark?: string // Hex 000000
        light?: string // Hex ffffff
    }
}

export class QrCodeService {
    async generate(options: QrCodeOptions): Promise<{ data: string | Buffer; contentType: string }> {
        const { text, format = 'svg', margin = 4, scale = 4, color } = options

        const opts: QRCode.QRCodeToBufferOptions = {
            margin,
            scale,
            color: {
                dark: color?.dark || '#000000',
                light: color?.light || '#ffffff',
            },
            errorCorrectionLevel: 'M',
        }

        if (format === 'svg') {
            const svg = await QRCode.toString(text, { ...opts, type: 'svg' })
            return { data: svg, contentType: 'image/svg+xml' }
        } else if (format === 'utf8') {
            const str = await QRCode.toString(text, { ...opts, type: 'utf8' })
            return { data: str, contentType: 'text/plain' }
        } else {
            // png: Requires Canvas, which is not available in Workers.
            // We explicitly throw an error here to prevent runtime crashes.
            throw new Error('PNG format is not supported in this serverless environment. Please use SVG.')
        }
    }
}
