import { defineConfig } from 'astro/config';

// Published to the GitHub Pages user site: https://haphanhp.github.io (repo haphanhp/haphanhp.github.io).
// Static output: copy the contents of dist/ to the root of that repo (see README-SITE in the PR).
export default defineConfig({
  site: 'https://haphanhp.github.io',
  output: 'static',
  redirects: { '/': '/projects/' },
});
