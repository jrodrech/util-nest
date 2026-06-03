import { html } from 'hono/html'
import { BaseLayout } from '../components/base-layout'

type ConnectionIds = {
    google: string
    facebook: string
    github: string
    microsoft: string
    apple: string
}

export const LoginPage = (kindeIssuer: string, clientId: string, conn: ConnectionIds) => {
    const content = html`
    <div class="center-content">
        <div class="card" style="width: 100%; max-width: 400px;">
            <div class="text-center">
                <div class="logo-text" style="font-size: 1.75rem; margin-bottom: 0.5rem;">UtilNest</div>
                <p class="text-secondary" style="margin-bottom: 2rem;">Welcome back! Please sign in to continue.</p>
            </div>

            <style>
                /* Page specific styles */
                .social-grid { display: grid; gap: 0.75rem; }
                .social-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 10px; background: #272732; border: 1px solid var(--border); color: white; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: all 0.2s; box-sizing: border-box; }
                .social-btn:hover { background: #323240; border-color: #4a4a5a; }
                .social-btn img, .social-btn svg { width: 20px; height: 20px; margin-right: 10px; }
                .social-btn.microsoft svg { width: 18px; height: 18px; }
                
                .divider { display: flex; align-items: center; text-align: center; color: var(--text-secondary); margin: 1.5rem 0; font-size: 0.85rem; }
                .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border); }
                .divider:not(:empty)::before { margin-right: .5em; }
                .divider:not(:empty)::after { margin-left: .5em; }
            </style>

            <div class="social-grid">
                <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback&connection_id=${conn.google}" class="social-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google">
                    Sign in with Google
                </a>

                <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback&connection_id=${conn.facebook}" class="social-btn">
                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" style="filter: brightness(0) invert(1);">
                    Sign in with Facebook
                </a>

                <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback&connection_id=${conn.github}" class="social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    Sign in with GitHub
                </a>

                <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback&connection_id=${conn.microsoft}" class="social-btn microsoft">
                    <svg viewBox="0 0 23 23" fill="currentColor"><path d="M0 0h11.31v11.31H0V0zm11.31 0H22.62v11.31H11.31V0zM0 11.31h11.31V22.62H0V11.31zm11.31 0H22.62V22.62H11.31V11.31z"/></svg>
                    Sign in with Microsoft
                </a>

                <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback&connection_id=${conn.apple}" class="social-btn">
                    <svg viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/></svg>
                    Sign in with Apple
                </a>
            </div>

            <div class="divider">OR</div>

            <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback" class="btn btn-full">
                Continue with Email
            </a>

            <div class="footer">
                Don't have an account? <a href="${kindeIssuer}/oauth2/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=https://cloudflare-api-platform.jrodrech.workers.dev/auth/callback&start_page=registration">Sign up</a>
            </div>
        </div>
    </div>
    `

    return BaseLayout({
        title: 'Sign In',
        children: content,
        showNav: false
    })
}
