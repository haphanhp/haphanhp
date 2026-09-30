import { defineConfig } from 'astro/config';

// Assumption: the site is served at https://haphan.digital (change `site` if it is not).
export default defineConfig({
  site: 'https://haphan.digital',
  output: 'static',
  redirects: { '/': '/projects/' },
});
