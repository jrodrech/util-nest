/**
 * Base HTML Layout with SEO meta tags and shared styling
 */

export interface LayoutOptions {
    title: string
    description: string
    path: string
    content: string
}

const BASE_URL = 'https://cloudflare-api-platform.jrodrech.workers.dev'

export function renderLayout(opts: LayoutOptions): string {
    const fullUrl = `${BASE_URL}${opts.path}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${opts.title} | UtilNest</title>
    <meta name="description" content="${opts.description}">
    <link rel="canonical" href="${fullUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${opts.title}">
    <meta property="og:description" content="${opts.description}">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${opts.title}">
    <meta name="twitter:description" content="${opts.description}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a24;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --accent-primary: #7c3aed;
            --accent-secondary: #3b82f6;
            --gradient: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            --border-color: #2a2a3a;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
        }
        
        a {
            color: var(--accent-secondary);
            text-decoration: none;
            transition: color 0.2s;
        }
        
        a:hover {
            color: var(--accent-primary);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }
        
        /* Navbar */
        .navbar {
            background: rgba(10, 10, 15, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .navbar .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 64px;
        }
        
        .logo {
            font-size: 1.25rem;
            font-weight: 700;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .nav-links {
            display: flex;
            gap: 32px;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--text-secondary);
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .nav-links a:hover,
        .nav-links a.active {
            color: var(--text-primary);
        }
        
        /* Hero */
        .hero {
            padding: 120px 0 80px;
            text-align: center;
            background: radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15), transparent 50%);
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 24px;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto 40px;
        }
        
        /* Buttons */
        .btn {
            display: inline-block;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }
        
        .btn-primary {
            background: var(--gradient);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
        }
        
        .btn-secondary {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
        }
        
        .btn-secondary:hover {
            border-color: var(--accent-primary);
        }
        
        /* Cards */
        .card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s;
        }
        
        .card:hover {
            border-color: var(--accent-primary);
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }
        
        .card h3 {
            font-size: 1.25rem;
            margin-bottom: 8px;
        }
        
        .card p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
        
        /* Grid */
        .grid {
            display: grid;
            gap: 24px;
        }
        
        .grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        /* Section */
        section {
            padding: 80px 0;
        }
        
        section h2 {
            font-size: 2rem;
            margin-bottom: 40px;
            text-align: center;
        }
        
        /* Footer */
        footer {
            border-top: 1px solid var(--border-color);
            padding: 40px 0;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        /* Forms */
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 1rem;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--accent-primary);
        }
        
        /* Code Block */
        .code-block {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            word-break: break-all;
        }
        
        /* Status Badge */
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .badge-active {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }
        
        .badge-beta {
            background: rgba(234, 179, 8, 0.2);
            color: #eab308;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <a href="/" class="logo">UtilNest</a>
            <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/apis">APIs</a></li>
                <li><a href="/docs/authentication">Docs</a></li>
                <li><a href="/auth/login" class="btn btn-primary" style="padding: 8px 20px;">Sign In</a></li>
            </ul>
        </div>
    </nav>
    
    <main>
        ${opts.content}
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} UtilNest. Built on Cloudflare Workers.</p>
        </div>
    </footer>
</body>
</html>`
}
