import { Hono } from 'hono'
import { html } from 'hono/html'
import { UserAuthService } from './service'
import { LoginPage } from '../../portal/pages/login'
import { BaseLayout } from '../../portal/components/base-layout'
import { Bindings } from '../../types'
import { getBaseUrl } from '../../common/utils'

const router = new Hono<{ Bindings: Bindings }>()

router.get('/login-ui', (c) => {
    return c.html(LoginPage(c.env.UTILNEST_KINDE_ISSUER_URL, c.env.UTILNEST_KINDE_CLIENT_ID, {
        google: c.env.KINDE_CONN_GOOGLE,
        facebook: c.env.KINDE_CONN_FACEBOOK,
        github: c.env.KINDE_CONN_GITHUB,
        microsoft: c.env.KINDE_CONN_MICROSOFT,
        apple: c.env.KINDE_CONN_APPLE
    }))
})

// Helper to create auth service with env bindings
function createAuthService(env: Bindings, baseUrl: string): UserAuthService {
    return new UserAuthService({
        clientId: env.UTILNEST_KINDE_CLIENT_ID,
        clientSecret: env.UTILNEST_KINDE_CLIENT_SECRET,
        issuerUrl: env.UTILNEST_KINDE_ISSUER_URL,
        redirectUri: `${baseUrl}/auth/callback`
    })
}

/**
 * GET /auth/login
 * Redirects user to Kinde login page
 */
router.get('/login', (c) => {
    const baseUrl = getBaseUrl(c.req.raw)
    const authService = createAuthService(c.env, baseUrl)

    // Generate a random state for CSRF protection
    const state = crypto.randomUUID()

    // In production, you'd store this state in a cookie or session
    // For now, we'll skip state validation for simplicity

    const loginUrl = authService.getLoginUrl(state)
    return c.redirect(loginUrl)
})

/**
 * GET /auth/callback
 * Handles the redirect after Kinde login
 * Exchanges authorization code for tokens
 */
router.get('/callback', async (c) => {
    const code = c.req.query('code')
    const error = c.req.query('error')

    if (error) {
        return c.html(BaseLayout({
            title: 'Login Failed',
            showNav: false,
            children: html`
                <div class="center-content">
                    <div class="card" style="width: 100%; max-width: 400px; text-align: center;">
                        <h1 style="color: var(--error);">Login Failed</h1>
                        <p class="text-secondary">${error}</p>
                        <a href="/auth/login" class="btn btn-full">Try Again</a>
                    </div>
                </div>
            `
        }), 400)
    }

    if (!code) {
        return c.redirect('/auth/login')
    }

    try {
        const baseUrl = getBaseUrl(c.req.raw)
        const authService = createAuthService(c.env, baseUrl)
        const tokens = await authService.exchangeCodeForTokens(code)

        // Decode the ID token to get user roles
        // ID token is a JWT, we just need to decode the payload (middle part)
        let isAdmin = false
        try {
            const idTokenParts = tokens.id_token.split('.')
            if (idTokenParts.length === 3) {
                const payload = JSON.parse(atob(idTokenParts[1].replace(/-/g, '+').replace(/_/g, '/')))
                const roles = payload.roles || []
                isAdmin = roles.includes('admin')
            }
        } catch (e) {
            console.error('Failed to decode ID token for roles:', e)
        }

        // Conditionally render Access Token section (only for admins)
        const accessTokenSection = isAdmin ? html`
            <span class="label">Your Access Token</span>
            <div class="token-box" id="accessToken">${tokens.access_token}</div>
            <p style="font-size: 0.85rem;">This token proves your identity. You can use it to create API keys.</p>
        ` : html`
            <p style="font-size: 0.85rem; color: var(--success);">You are logged in as a Developer. Create your API key below!</p>
        `

        // Render Dashboard
        const content = html`
            <style>
                .dashboard-container { width: 100%; max-width: 600px; margin: 40px auto; }
                .label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary); }
                .token-box { background: #121218; padding: 1rem; border-radius: 8px; border: 1px solid var(--border); font-family: monospace; word-break: break-all; color: #a0aec0; font-size: 0.9rem; margin-bottom: 1rem; position: relative; }
                input { width: 100%; background: #121218; border: 1px solid var(--border); color: white; padding: 12px; border-radius: 8px; margin-bottom: 1rem; box-sizing: border-box; font-size: 1rem; }
                input:focus { outline: none; border-color: var(--accent); }
                .success-box { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
                .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
                .icon-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; color: #a0a0b0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .icon-btn svg { width: 18px; height: 18px; }
                .role-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; vertical-align: middle; }
                .role-admin { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
                .role-dev { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
            </style>

            <div class="container dashboard-container">
                <div class="logo-text text-center" style="margin-bottom: 2rem;">UtilNest Dashboard</div>
                
                <!-- Welcome Card -->
                <div class="card" style="margin-bottom: 2rem;">
                    <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">👋 Welcome! <span class="role-badge ${isAdmin ? 'role-admin' : 'role-dev'}">${isAdmin ? 'Admin' : 'Developer'}</span></h1>
                    <p class="text-secondary">You have successfully logged in via Kinde.</p>
                    
                    ${accessTokenSection}
                </div>

                <!-- Create Key Card -->
                <div class="card">
                    <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑 Create API Key</h1>
                    <p class="text-secondary">Generate a permanent API key for your applications.</p>
                    
                    <form id="createKeyForm">
                        <label class="label">Application Name</label>
                        <input type="text" id="keyName" placeholder="e.g., My iPhone App" required>
                        <button type="submit" class="btn btn-full" id="submitBtn">Generate Key</button>
                    </form>

                    <div id="successBox" class="success-box">
                        <h3 style="margin:0 0 0.5rem 0; color: #4ade80;">Success!</h3>
                        <p style="color: #bbf7d0; margin-bottom: 0.5rem;">Save your key immediately:</p>
                        <div class="token-box" style="display: flex; align-items: center; justify-content: space-between; border-color: #4ade80;">
                            <span id="newKey" style="color: #fff; font-weight: bold; font-family: monospace;"></span>
                            <button id="copyBtn" class="icon-btn" title="Copy to clipboard">
                                <svg id="copyIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <svg id="checkIcon" style="display: none; color: #4ade80;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div id="errorBox" class="error-box"></div>
                </div>
                
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="/auth/logout" style="color: var(--text-secondary); font-size: 0.9rem;">Sign Out</a>
                </div>
            </div>

            <script>
                const form = document.getElementById('createKeyForm');
                const token = "${tokens.access_token}";
                
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('submitBtn');
                    const nameInput = document.getElementById('keyName');
                    const successBox = document.getElementById('successBox');
                    const errorBox = document.getElementById('errorBox');
                    
                    btn.disabled = true;
                    btn.innerText = 'Generating...';
                    successBox.style.display = 'none';
                    errorBox.style.display = 'none';
                    
                    try {
                        const res = await fetch('/auth/keys', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name: nameInput.value })
                        });
                        
                        const data = await res.json();
                        
                        if (!res.ok) throw new Error(data.message || 'Failed to create key');
                        
                        document.getElementById('newKey').innerText = data.key;
                        successBox.style.display = 'block';
                        nameInput.value = '';
                        
                    } catch (err) {
                        errorBox.innerText = err.message;
                        errorBox.style.display = 'block';
                    } finally {
                        btn.disabled = false;
                        btn.innerText = 'Generate Key';
                    }
                });

                document.getElementById('copyBtn').addEventListener('click', async () => {
                    const key = document.getElementById('newKey').innerText;
                    if (!key) return;
                    try {
                        await navigator.clipboard.writeText(key);
                        const copyIcon = document.getElementById('copyIcon');
                        const checkIcon = document.getElementById('checkIcon');
                        copyIcon.style.display = 'none';
                        checkIcon.style.display = 'block';
                        setTimeout(() => {
                            copyIcon.style.display = 'block';
                            checkIcon.style.display = 'none';
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy!', err);
                    }
                });
            </script>
        `

        return c.html(BaseLayout({
            title: 'Dashboard',
            showNav: false,
            children: content
        }))
    } catch (e: any) {
        return c.html(BaseLayout({
            title: 'Login Error',
            showNav: false,
            children: html`
                <div class="center-content">
                    <div class="card" style="width: 100%; max-width: 400px; text-align: center;">
                        <h1 style="color: var(--error);">Login Session Expired</h1>
                        <p class="text-secondary">The authorization code has expired or was already used. Please log in again.</p>
                        <a href="/auth/login" class="btn btn-full">Log In Again</a>
                    </div>
                </div>
            `
        }), 401)
    }
})

/**
 * GET /auth/logout
 * Redirects user to Kinde logout
 */
router.get('/logout', (c) => {
    const baseUrl = getBaseUrl(c.req.raw)
    const authService = createAuthService(c.env, baseUrl)

    const logoutUrl = authService.getLogoutUrl(baseUrl)
    return c.redirect(logoutUrl)
})

/**
 * GET /auth/me
 * Returns the current user's info from their token
 * Requires: Authorization: Bearer <access_token>
 */
router.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({
            error: 'Unauthorized',
            message: 'Please provide Authorization: Bearer <access_token>'
        }, 401)
    }

    const token = authHeader.substring(7)
    const baseUrl = getBaseUrl(c.req.raw)
    const authService = createAuthService(c.env, baseUrl)

    const user = await authService.validateToken(token)

    if (!user) {
        return c.json({ error: 'Invalid or expired token' }, 401)
    }

    return c.json({
        user_id: user.sub,
        email: user.email,
        name: [user.given_name, user.family_name].filter(Boolean).join(' ') || undefined
    })
})

/**
 * POST /auth/keys
 * Creates an API key linked to the authenticated user
 * Requires: Authorization: Bearer <access_token>
 */
router.post('/keys', async (c) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({
            error: 'Unauthorized',
            message: 'You must be logged in to create API keys. Please provide Authorization: Bearer <access_token>'
        }, 401)
    }

    const token = authHeader.substring(7)
    const baseUrl = getBaseUrl(c.req.raw)
    const userAuthService = createAuthService(c.env, baseUrl)

    const user = await userAuthService.validateToken(token)

    if (!user) {
        return c.json({ error: 'Invalid or expired token' }, 401)
    }

    // Get request body
    const body = await c.req.json().catch(() => ({})) as any
    const keyName = body.name || 'My API Key'

    // Import AuthService for key creation
    const { AuthService } = await import('../auth/service')
    const authService = new AuthService((c.env as any).DB)

    // Create key linked to user
    const result = await authService.createKey(keyName, [], user.sub)

    return c.json({
        message: 'API Key created successfully! Save it now, you will not see it again.',
        key: result.key,
        prefix: result.prefix,
        name: keyName,
        user_id: user.sub
    }, 201)
})

export { router as userAuthRouter }
