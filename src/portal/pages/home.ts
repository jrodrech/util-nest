import { html } from 'hono/html'
import { BaseLayout } from '../components/base-layout'

export function renderHomePage() {
    const content = html`
        <style>
            .hero { padding: 80px 0; text-align: center; }
            .hero h1 { font-size: 3rem; margin-bottom: 24px; background: linear-gradient(135deg, #7c3aed, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .hero p { font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 32px; }
            
            .grid { display: grid; gap: 24px; }
            .grid-3 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
            
            .card h3 { margin-bottom: 8px; color: var(--text-primary); }
            .card p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; }
            
            .btn-secondary { background: rgba(255,255,255,0.1); color: white; margin-left: 12px; }
            .btn-secondary:hover { background: rgba(255,255,255,0.2); }
        </style>

        <section class="hero">
            <div class="container">
                <h1>Utility APIs for Modern Developers</h1>
                <p>UtilNest is a collection of ready-to-use API suites. Generate mock data, create QR codes, extract link previews, and more — all from a single platform.</p>
                <a href="/auth/login" class="btn">Sign In to Get Started</a>
                <a href="/apis" class="btn btn-secondary">Explore API Suites</a>
            </div>
        </section>
        
        <section>
            <div class="container">
                <h2 class="text-center" style="margin-bottom: 40px;">What's Inside?</h2>
                <div class="grid grid-3">
                    <article class="card">
                        <h3>🎲 ChaosShop</h3>
                        <p>A mock e-commerce API designed to fail on demand. Perfect for testing how your frontend handles errors and latency.</p>
                    </article>
                    <article class="card">
                        <h3>👤 IdentityLease</h3>
                        <p>Generate consistent, locale-aware fake users for end-to-end testing. Same identity for the whole session.</p>
                    </article>
                    <article class="card">
                        <h3>🔗 Link Preview</h3>
                        <p>Extract OpenGraph and Twitter Card metadata from any URL. Build rich social sharing features instantly.</p>
                    </article>
                    <article class="card">
                        <h3>📱 QR Generator</h3>
                        <p>Generate SVG QR codes on-the-fly with customizable colors and sizing. No storage, no dependencies.</p>
                    </article>
                    <article class="card">
                        <h3>⚡ Edge-Powered</h3>
                        <p>Built on Cloudflare Workers for sub-50ms latency globally. No cold starts, no servers to manage.</p>
                    </article>
                    <article class="card">
                        <h3>📖 Documented</h3>
                        <p>Every API suite includes docs and examples. New to APIs? Start with the <a href="/docs/authentication">Authentication Guide</a>.</p>
                    </article>
                </div>
            </div>
        </section>
        
        <section style="text-align: center; padding: 80px 0 120px;">
            <div class="container">
                <h2>Ready to Get Started?</h2>
                <p class="text-secondary" style="margin-bottom: 32px;">Sign in to create your API key. It's free!</p>
                <a href="/auth/login" class="btn">Sign In with Kinde</a>
            </div>
        </section>
    `

    return BaseLayout({
        title: 'Utility APIs for Developers',
        children: content,
        showNav: true
    })
}


