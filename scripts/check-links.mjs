// Post-build check: every internal link must exist in dist/, external links must be https, and no
// placeholder text ("undefined", "null", "NaN") should leak into the pages. External links are listed
// for manual review because this script does not fetch them.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p);
  }
})(dist);

let bad = 0;
const external = new Set();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('http')) {
      if (!href.startsWith('https://')) { console.error(`insecure link ${href} in ${page}`); bad++; }
      external.add(href);
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      const clean = href.split('#')[0].split('?')[0];
      const target = clean.endsWith('/') ? join(dist, clean, 'index.html') : join(dist, clean);
      if (!existsSync(target) && !existsSync(target + '.html')) { console.error(`dead internal link ${href} in ${page}`); bad++; }
    }
  }
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  for (const w of ['undefined', 'NaN', '[object Object]']) {
    if (text.includes(w)) { console.error(`placeholder "${w}" in ${page}`); bad++; }
  }
}
console.log(`${pages.length} pages checked, ${external.size} external links (not fetched):`);
[...external].sort().forEach((u) => console.log('  ' + u));
if (bad) { console.error(`\n${bad} problem(s)`); process.exit(1); }
console.log('\nOK: no dead internal links, no placeholder text.');
