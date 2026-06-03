import { html } from 'hono/html'
import { BaseLayout } from '../components/base-layout'

interface Service {
    id: number
    name: string
    status: string
    docs_url: string | null
}

export function renderApisPage(services: Service[]) {
    const serviceCards = services.map(service => html`
        <article class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h3>${service.name}</h3>
                <span class="badge badge-${service.status === 'active' ? 'active' : 'beta'}">${service.status}</span>
            </div>
            <p style="margin-bottom: 16px; color: var(--text-secondary);">Explore the ${service.name} documentation and learn how to integrate it into your application.</p>
            ${service.docs_url
            ? html`<a href="${service.docs_url}" class="btn" style="font-size: 0.875rem; padding: 8px 16px; background: rgba(255,255,255,0.1);">View Documentation →</a>`
            : html`<span style="color: var(--text-secondary); font-size: 0.875rem;">Documentation coming soon</span>`
        }
        </article>
    `)

    const content = html`
        <style>
            .hero { padding: 80px 0 40px; }
            .grid { display: grid; gap: 24px; }
            .grid-3 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
            .badge-active { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
            .badge-beta { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        </style>

        <section class="hero text-center">
            <div class="container">
                <h1>Available APIs</h1>
                <p class="text-secondary">Explore our suite of developer-friendly APIs. Each service is designed to solve real testing challenges.</p>
            </div>
        </section>
        
        <section style="padding-top: 0;">
            <div class="container">
                <div class="grid grid-3">
                    ${serviceCards}
                </div>
            </div>
        </section>
    `

    return BaseLayout({
        title: 'API Suites',
        children: content,
        showNav: true
    })
}

