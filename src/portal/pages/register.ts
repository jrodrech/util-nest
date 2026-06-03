import { renderLayout } from '../components/layout'

export function renderRegisterPage(): string {
    const content = `
        <section class="hero" style="padding: 80px 0 40px;">
            <div class="container">
                <h1>Get Your API Key</h1>
                <p>Generate a free API key to start using ChaosShop APIs. No credit card required.</p>
            </div>
        </section>
        
        <section style="padding-top: 0;">
            <div class="container" style="max-width: 500px;">
                <div class="card">
                    <form id="register-form">
                        <div class="form-group">
                            <label for="owner">Application Name</label>
                            <input type="text" id="owner" name="owner" placeholder="My Awesome App" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Generate API Key</button>
                    </form>
                    
                    <div id="result" style="display: none; margin-top: 24px;">
                        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                            <p style="color: #22c55e; font-weight: 600; margin-bottom: 8px;">✓ API Key Created!</p>
                            <p style="color: var(--text-secondary); font-size: 0.875rem;">Save this key now. You won't be able to see it again.</p>
                        </div>
                        <div class="form-group">
                            <label>Your API Key</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" id="api-key" readonly style="font-family: monospace;">
                                <button type="button" id="copy-btn" class="btn btn-secondary" style="white-space: nowrap;">Copy</button>
                            </div>
                        </div>
                        <div class="code-block" style="margin-top: 16px;">
                            <p style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 8px;">Example Usage:</p>
                            <code>curl -H "x-api-key: <span id="key-example"></span>" \\<br>&nbsp;&nbsp;https://cloudflare-api-platform.jrodrech.workers.dev/api/v1/shop/products</code>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <script>
            const form = document.getElementById('register-form');
            const result = document.getElementById('result');
            const apiKeyInput = document.getElementById('api-key');
            const keyExample = document.getElementById('key-example');
            const copyBtn = document.getElementById('copy-btn');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const owner = document.getElementById('owner').value;
                
                try {
                    const res = await fetch('/api/v1/auth/keys', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ owner })
                    });
                    
                    if (!res.ok) throw new Error('Failed to create key');
                    
                    const data = await res.json();
                    apiKeyInput.value = data.key;
                    keyExample.textContent = data.key.substring(0, 20) + '...';
                    result.style.display = 'block';
                    form.style.display = 'none';
                } catch (err) {
                    alert('Error creating API key. Please try again.');
                }
            });
            
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(apiKeyInput.value);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = 'Copy', 2000);
            });
        </script>
    `

    return renderLayout({
        title: 'Get API Key',
        description: 'Generate a free API key to access UtilNest API suites. Start using our utility APIs in seconds.',
        path: '/register',
        content
    })
}
