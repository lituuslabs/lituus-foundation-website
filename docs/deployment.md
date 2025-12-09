# Deployment Guide

This project uses a dual deployment strategy:
- **Staging**: Cloudflare Workers Static Assets (manual)
- **Production**: GitHub Pages (automatic via GitHub Actions)

## Staging Deployment (Cloudflare Workers)

### Quick Start

```bash
npm run deploy:staging
```

This command:
1. Builds the static site (`astro build` → `./dist/`)
2. Deploys to Cloudflare Workers Static Assets via Wrangler

### Configuration

**File**: `wrangler.jsonc`

```json
{
  "name": "lituus",
  "compatibility_date": "2025-12-05",
  "assets": {
    "directory": "./dist"
  },
  "observability": {
    "enabled": true
  }
}
```

This configuration uses Workers Static Assets to serve static files **without any Worker code**. The platform serves files directly from `./dist/` at the edge.

### Staging URL

After deployment, the site is available at:
- Default: `https://<worker-name>.<subdomain>.workers.dev`
  - Worker name is defined in `wrangler.jsonc` (`name` field)
  - Subdomain is based on your Cloudflare account
- Custom domain: Configure in Cloudflare dashboard under Workers → Settings

## Production Deployment (GitHub Pages)

### Setup Order

**Complete these steps in this exact order:**

1. Enable GitHub Pages (Settings → Pages → Source: "GitHub Actions")
2. Configure `SITE_URL` variable (Settings → Actions → Variables) - **Recommended**
3. Deploy to GitHub Pages (merge to `main` - happens automatically)
4. Configure custom domain in GitHub (Settings → Pages → Custom domain)
5. Configure DNS records at your DNS provider
6. Wait for DNS propagation (up to 24 hours)
7. Enable "Enforce HTTPS" (Settings → Pages)

**Note:** Step 2 is optional but strongly recommended. Without `SITE_URL`, Astro will not generate sitemaps or canonical URLs, which affects SEO.

**Detailed instructions for each step are below.**

### Automatic Deployment

Production deploys **automatically** when you push to the `main` branch.

**Workflow**: `.github/workflows/gh-pages-deploy.yml`

```yaml
name: Deploy to GitHub Pages (Production)

on:
  push:
    branches: [ main ]
  workflow_dispatch:
```

### GitHub Repository Setup

#### 1. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select: **GitHub Actions**
3. Save the configuration

#### 2. Configure Environment Variables (Recommended)

Go to repository **Settings** → **Secrets and variables** → **Actions** → **Variables** tab

##### SITE_URL (Recommended for SEO)

**Why this matters:** Without `SITE_URL`, Astro will not generate sitemaps or canonical URLs, which negatively impacts SEO and social sharing.

Create variable:
- **Name**: `SITE_URL`
- **Value**: `https://yourdomain.com` (your production URL)

Example values:
- Custom domain: `https://yourdomain.org`
- GitHub Pages default: `https://<username>.github.io/<repo-name>`

**Note:** If you skip this step, the GitHub Actions workflow will show a warning, but deployment will still succeed.

##### BASE_PATH (Required for GitHub Pages Subdirectory)

**Why this matters:** When deploying to `github.io/<repo-name>`, assets need the correct path prefix. Without `BASE_PATH`, CSS, JavaScript, and images will fail to load.

Create variable:
- **Name**: `BASE_PATH`
- **Value**: `/lituus-foundation-website` (must match your repository name)

**When to set BASE_PATH:**
- ✅ **Using `github.io/repo-name` URL**: Set to `/repo-name`
- ❌ **Using custom domain**: Leave unset or set to `/`
- ❌ **Cloudflare Workers staging**: Not needed (always uses root path)

**Important:** If you switch from GitHub Pages subdirectory to a custom domain later, you must remove or change `BASE_PATH` to `/` for assets to work correctly.

#### 3. Add Custom Domain

**Important:** When using GitHub Actions for deployment (as this project does), configure your custom domain through repository settings only. Do not create a CNAME file in your repository - GitHub Actions deployments ignore CNAME files.

**Steps:**

1. In **Settings** → **Pages**
2. Under **Custom domain**, enter your domain (e.g., `lituusfoundation.org`)
3. Click **Save** (GitHub will handle domain configuration automatically)
4. **Do NOT enable "Enforce HTTPS" yet** - wait until after DNS propagation completes

**Security Best Practice:** Verify your custom domain in your GitHub account settings before adding it to your repository to prevent domain takeover attacks.

### DNS Configuration for Custom Domain

**Complete this AFTER configuring your custom domain in GitHub Settings above.**

#### Recommended Approach: www Subdomain

GitHub recommends always using a `www` subdomain (e.g., `www.example.com`) even if you also configure an apex domain. This approach provides better reliability and automatic redirects.

**For www Subdomain**, add a CNAME record:

```
Type     Name    Value
CNAME    www     <username>.github.io
```

Replace `<username>` with your GitHub username or organization name.

#### For Apex Domain (example.com)

**Option 1: A Records (Recommended)**

Add these four A records to your DNS provider:

```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
```

**Option 2: AAAA Records (IPv6 Support)**

For IPv6 support, add these AAAA records (in addition to A records, not as replacement):

```
Type     Name    Value
AAAA    @       2606:50c0:8000::153
AAAA    @       2606:50c0:8001::153
AAAA    @       2606:50c0:8002::153
AAAA    @       2606:50c0:8003::153
```

**Note:** GitHub highly recommends using A records in addition to AAAA records due to slow global IPv6 adoption.

**Option 3: ALIAS/ANAME Records (Alternative)**

Some DNS providers support ALIAS or ANAME records. Point your apex domain to `<username>.github.io`.

#### Automatic Redirects

When you configure both apex and www subdomain correctly, GitHub Pages automatically creates redirects between them. For example:
- If you configure `www.example.com`, then `example.com` redirects to `www.example.com`
- If you configure `example.com`, then `www.example.com` redirects to `example.com`

#### DNS Propagation

- DNS changes can take up to 24 hours to propagate
- Use [DNS Checker](https://dnschecker.org/) to verify propagation
- GitHub will issue an SSL certificate automatically after DNS is verified
- Do not enable "Enforce HTTPS" until DNS propagation is complete

### Manual Production Deployment

If needed, you can manually trigger a production deployment:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to GitHub Pages (Production)**
3. Click **Run workflow** → **Run workflow**

## Deployment Workflow

### For Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test locally
npm run dev

# 3. Preview with Workers runtime
npm run preview

# 4. Deploy to staging for testing
npm run deploy:staging

# 5. Push to GitHub and create PR
git push origin feature/my-feature
```

### For Production Release

```bash
# 1. Merge PR to main (via GitHub UI)

# 2. GitHub Actions automatically:
#    - Builds the site
#    - Deploys to GitHub Pages
#    - Makes it live at your production URL

# 3. Verify deployment (1-2 minutes)
#    - Check Actions tab for status
#    - Visit production URL
```

## Troubleshooting

### Staging Deployment Fails

**Error**: `Not logged in`

```bash
wrangler login
```

**Error**: `No such project`

Check `wrangler.jsonc` has correct `name` field.

### Production Deployment Fails

**Missing `SITE_URL` variable**

1. Go to Settings → Secrets and variables → Actions → Variables
2. Add `SITE_URL` variable

**GitHub Pages not enabled**

1. Go to Settings → Pages
2. Set Source to "GitHub Actions"

**Custom domain not working**

1. Verify DNS records are correct
2. Check DNS propagation: https://dnschecker.org/
3. Wait 24-48 hours for full propagation
4. Ensure "Enforce HTTPS" is enabled after DNS propagates

### Build Failures

Check the Actions tab for detailed error logs:

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Expand the failed step to see error details

Common issues:
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Run `npm run build` locally to catch errors
- Invalid Astro configuration: Check `astro.config.mjs`

## Environment Variables

### Local Development

```bash
# Optional: Set custom site URL for local builds
export SITE_URL=http://localhost:3000
npm run build
```

### Staging (Cloudflare Workers)

No environment variables needed. Site URL defaults to Workers domain.

### Production (GitHub Pages)

Set via GitHub repository variables:
- `SITE_URL`: Production URL (recommended for SEO)
- `BASE_PATH`: Path prefix for subdirectory deployment
  - Set to `/repo-name` when using `github.io/<repo-name>`
  - Leave unset or set to `/` when using custom domain

## Monitoring

### Staging

- **Observability**: Enabled in `wrangler.jsonc`
- **Logs**: View in Cloudflare dashboard → Workers → Logs

### Production

- **GitHub Actions**: Monitor deployment status in Actions tab
- **GitHub Pages**: View deployment history in Settings → Pages

## Cost

### Staging (Cloudflare Workers)

- **Free tier**: 100,000 requests/day
- **Pricing**: https://developers.cloudflare.com/workers/platform/pricing/

### Production (GitHub Pages)

- **Free** for public repositories
- **Bandwidth**: 100 GB/month soft limit
- **Build minutes**: Unlimited for public repos

## Additional Resources

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
