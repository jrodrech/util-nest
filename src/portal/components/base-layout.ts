
import { html } from 'hono/html'

type LayoutProps = {
    title: string
    children: any
    showNav?: boolean
}

export const BaseLayout = (props: LayoutProps) => html`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.title} | UtilNest</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-card: #1a1a24;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --accent: #7c3aed;
            --accent-hover: #6d28d9;
            --border: #2a2a3a;
            --success: #4ade80;
            --error: #f87171;
        }
        body { 
            font-family: 'Inter', sans-serif; 
            background: var(--bg-primary); 
            color: var(--text-primary); 
            margin: 0; 
            min-height: 100vh; 
            display: flex;
            flex-direction: column;
        }
        
        a { color: var(--accent); text-decoration: none; transition: color 0.2s; }
        a:hover { color: var(--accent-hover); }

        /* Utility Classes */
        .container { 
            width: 100%; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
            box-sizing: border-box;
        }
        
        .center-content {
            display: grid; 
            place-items: center; 
            flex-grow: 1;
        }

        .card { 
            background: var(--bg-card); 
            border: 1px solid var(--border); 
            border-radius: 16px; 
            padding: 2.5rem; 
            box-shadow: 0 4px 30px rgba(0,0,0,0.3); 
        }

        .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            background: var(--accent); 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 1rem; 
            font-weight: 600; 
            cursor: pointer; 
            transition: background 0.2s; 
            text-align: center;
        }
        .btn:hover { background: var(--accent-hover); }
        .btn-full { width: 100%; box-sizing: border-box; }

        /* Typography */
        h1, h2, h3 { margin-top: 0; }
        .text-center { text-align: center; }
        .text-secondary { color: var(--text-secondary); }
        
        /* Logo */
        .logo-text {
            font-size: 1.5rem; 
            font-weight: 700; 
            background: linear-gradient(135deg, #7c3aed, #3b82f6); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>
    ${props.showNav ? NavBar() : ''}
    
    ${props.children}
</body>
</html>
`

const NavBar = () => html`
<nav style="border-bottom: 1px solid var(--border); padding: 1rem 0; background: rgba(10,10,15,0.8); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 10;">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
        <a href="/" class="logo-text" style="font-size: 1.25rem;">UtilNest</a>
        <div style="display: flex; gap: 20px;">
            <a href="/apis" style="color: var(--text-secondary);">APIs</a>
            <a href="/docs/authentication" style="color: var(--text-secondary);">Docs</a>
            <a href="/auth/login" class="btn" style="padding: 6px 16px; font-size: 0.9rem;">Sign In</a>
        </div>
    </div>
</nav>
`
