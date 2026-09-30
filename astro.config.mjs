import { defineConfig } from 'astro/config';

// Main site: https://haphan.digital (domain bought at Namecheap, deployed on Vercel).
// Static output: Vercel serves it as-is, so no adapter is needed. DNS and secrets are configured outside this repo.
export default defineConfig({
  site: 'https://haphan.digital',
  output: 'static',
  redirects: { '/': '/projects/' },
});
