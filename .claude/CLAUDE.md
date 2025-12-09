# Lituus Foundation Website

## Quick Commands

```bash
npm run dev           # Astro dev server at localhost:4321
npm run build         # Build static site to ./dist/
npm run preview       # Build + test with Wrangler (Workers runtime)
npm run deploy:staging # Build + deploy to Cloudflare Workers (staging)
npm run deploy        # Alias for deploy:staging
npm run cf-typegen    # Generate Cloudflare type definitions
```

## Project Overview

- **Framework**: Astro 5.16.4
- **Deployment**:
  - **Staging**: Cloudflare Workers Static Assets
  - **Production**: GitHub Pages (auto-deployed via GitHub Actions on push to `main`)
- **Build Output**: `./dist/` (pure static HTML/CSS/JS)
- **Current State**: Minimal template, early-stage foundation website

## Architecture

This is a **static Astro** project with dual deployment targets:

- **Static Content**: Astro generates HTML/CSS/JS to `./dist/` (no SSR)
- **Staging**: Workers Static Assets serves files directly from `./dist/`
- **Production**: GitHub Pages serves files from `./dist/`
- **No Adapter**: Pure static output, no Cloudflare adapter needed

## Project Structure

```
src/
  ├── pages/
  │   └── index.astro (file-based routing)
  ├── components/ (reusable Astro components)
  ├── env.d.ts (Cloudflare runtime types)
public/
  ├── favicon.svg
  └── .assetsignore (excludes _worker.js from assets)
```

## Key Configuration Files

- **wrangler.jsonc**: Workers Static Assets configuration (staging deployments)
- **astro.config.mjs**: Static output with site URL and base path configuration
  - `site` is conditionally set only when `SITE_URL` is defined (omitted otherwise)
  - When omitted: Astro won't generate sitemaps or canonical URLs (affects SEO)
  - `base` path configured via `BASE_PATH` environment variable (defaults to `/`)
  - Set via environment variables:
    - `SITE_URL`: Full production URL (GitHub Actions: `vars.SITE_URL`)
    - `BASE_PATH`: Path prefix for assets (GitHub Actions: `vars.BASE_PATH`)
- **tsconfig.json**: TypeScript strict mode
- **.github/workflows/gh-pages-deploy.yml**: Production deployment automation
  - Checks for `SITE_URL` variable and warns if not set
  - Deployment succeeds without it, but SEO features disabled

## Astro Static Site Patterns

### Static Components (Zero JS)
- `.astro` files render to static HTML by default
- Use for content, layouts, page structure
- No JavaScript sent to browser for these components

### Interactive Components (Optional)
- Import UI frameworks (React, Vue, Svelte) as "islands"
- Requires `client:*` directive (e.g., `client:idle`)
- Props must be serializable (no functions)
- Use sparingly for better performance

### Note on Server Routes
- This project is configured for **static output only**
- No server-side rendering or API routes
- All pages are pre-rendered at build time

## Styling & Components

- **CSS Framework**: Tailwind CSS 4.1.17
- **Images in CSS**: Always use Tailwind classes (e.g., `bg-[url('/images/...')]`) instead of inline styles, as Tailwind processes through Vite and respects BASE_PATH configuration

## Development Workflow

1. Create `.astro` files in `src/pages/` for routes
2. Create reusable `.astro` components in `src/components/`
3. Run `npm run dev` for local development
4. Test with Workers runtime using `npm run preview`
5. Deploy to staging with `npm run deploy:staging`
6. Push to `main` branch for automatic production deployment

## Deployment

This project uses a dual deployment strategy:
- **Staging**: Cloudflare Workers Static Assets (manual via `npm run deploy:staging`)
- **Production**: GitHub Pages (automatic via GitHub Actions on push to `main`)

**For complete deployment instructions**, see [docs/deployment.md](../docs/deployment.md):
- Staging deployment to Cloudflare Workers
- Production deployment setup for GitHub Pages
- GitHub repository configuration
- Custom domain setup and DNS configuration
- Troubleshooting guide

## Constraints & Decisions

- Static-only approach: All pages pre-rendered at build time
- No server-side rendering or API routes
- Dual deployment: Workers (staging) + GitHub Pages (production)
- TypeScript strict mode enforced
- Observability enabled for staging
- No framework components added yet (pure Astro)
- SITE_URL is optional but strongly recommended for SEO (sitemaps, canonical URLs)
  - `site` config is conditionally included only when SITE_URL is defined
  - No fallback to avoid generating incorrect URLs
  - GitHub Actions workflow warns if not configured
