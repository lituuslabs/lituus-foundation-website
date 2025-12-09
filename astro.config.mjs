// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Static output (no adapter needed for static sites)
  // Site URL is set via SITE_URL environment variable (GitHub Actions: vars.SITE_URL)
  // If not set, Astro will not generate sitemaps or canonical URLs
  ...(process.env.SITE_URL && { site: process.env.SITE_URL }),

  // Base path for deployment
  // - GitHub Pages subdirectory: set BASE_PATH to '/repo-name'
  // - Custom domain or root deployment: leave BASE_PATH unset or set to '/'
  // - Cloudflare Workers staging: always uses root '/'
  base: process.env.BASE_PATH || '/',

  vite: {
    plugins: [tailwindcss()]
  }
});