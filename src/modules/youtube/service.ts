
export class YouTubeService {
    /**
     * Extracts the video ID from various YouTube URL formats
     */
    extractVideoId(url: string): string | null {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    /**
     * Fetches video metadata using oEmbed (official and reliable)
     */
    async getVideoInfo(videoId: string) {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        const response = await fetch(oembedUrl)

        if (!response.ok) {
            throw new Error('Video not found or private')
        }

        const data = await response.json() as any
        return {
            title: data.title,
            author_name: data.author_name,
            author_url: data.author_url,
            thumbnail_url: data.thumbnail_url,
            type: data.type,
            provider_name: data.provider_name,
            html: data.html
        }
    }

    /**
     * Scrapes the transcript from the video page
     * Note: This is fragile and depends on YouTube's HTML structure
     */
    async getTranscript(videoId: string) {
        const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`
        const response = await fetch(videoPageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        })
        const html = await response.text()

        // Extract the player response JSON
        const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/)
        if (!playerResponseMatch) {
            throw new Error('Could not parse video data')
        }

        const playerResponse = JSON.parse(playerResponseMatch[1])
        const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks

        if (!captions || captions.length === 0) {
            throw new Error('No transcripts available for this video')
        }

        // Fetch the first caption track (usually English or default)
        const trackUrl = captions[0].baseUrl
        const transcriptResponse = await fetch(trackUrl)
        const transcriptXml = await transcriptResponse.text()

        // Simple XML parsing (since we don't have a DOM parser in Workers)
        // Format: <text start="0.5" dur="3.2">Hello world</text>
        const transcripts = []
        const regex = /<text start="([\d.]+)" dur="([\d.]+)">([^<]+)<\/text>/g
        let match

        while ((match = regex.exec(transcriptXml)) !== null) {
            transcripts.push({
                start: parseFloat(match[1]),
                duration: parseFloat(match[2]),
                text: match[3].replace(/&#39;/g, "'").replace(/&quot;/g, '"') // Basic unescape
            })
        }

        return {
            language: captions[0].name.simpleText,
            captions: transcripts
        }
    }

    /**
     * Extracts audio stream URL
     */
    async getAudioStream(videoId: string) {
        // Since we can't use ytdl-core in Workers easily (node dependencies),
        // we'll try to find the streaming data in the same player response.

        const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`
        const response = await fetch(videoPageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        })
        const html = await response.text()

        const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/)
        if (!playerResponseMatch) {
            throw new Error('Could not parse video data')
        }

        const playerResponse = JSON.parse(playerResponseMatch[1])
        const formats = playerResponse?.streamingData?.adaptiveFormats

        if (!formats) {
            throw new Error('No streaming data found')
        }

        // Find best audio-only format (usually extracting WebM or M4A)
        // mimeType: "audio/mp4; codecs=\"mp4a.40.2\""
        const audioFormat = formats.find((f: any) => f.mimeType.includes('audio/mp4')) ||
            formats.find((f: any) => f.mimeType.includes('audio'))

        if (!audioFormat) {
            throw new Error('No audio stream found')
        }

        return {
            url: audioFormat.url,
            mimeType: audioFormat.mimeType,
            bitrate: audioFormat.bitrate
        }
    }
}
