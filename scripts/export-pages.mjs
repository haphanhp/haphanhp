// Copies the built site (dist/) into a checkout of haphanhp/haphanhp.github.io and adds .nojekyll
// (GitHub Pages would otherwise ignore the `_astro` folder).
// Usage: npm run build && npm run export -- ../haphanhp.github.io
import { cpSync, existsSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const target = process.argv[2];
if (!target || !existsSync('dist')) {
  console.error('Usage: npm run build && npm run export -- <path to haphanhp.github.io checkout>');
  process.exit(1);
}
const out = resolve(target);
// remove only what a previous export created, never readme.md or .git
for (const name of ['index.html', 'projects', 'stack', 'favicon.svg', '_astro']) {
  const p = join(out, name);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}
for (const name of readdirSync('dist')) cpSync(join('dist', name), join(out, name), { recursive: true });
writeFileSync(join(out, '.nojekyll'), '');
console.log(`Exported dist/ to ${out}`);
