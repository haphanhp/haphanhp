// Builds PROJECTS.md and STACK.md (rendered natively by GitHub) from the same data the Astro pages use:
//   src/content/projects/*.md  and  src/data/stack.json
// Run: npm run md
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

// --- tiny frontmatter parser (flat `key: value` only) ---
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const o = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1);
    o[kv[1]] = /^\d+$/.test(v) ? Number(v) : v;
  }
  return o;
}

const bio = [
  '🌱 A stray soul in a dry, code-heavy world, wandering into tech by accident and staying for the plants.',
  '🎮 I build small, cozy things, just playing in the sandbox like a curious outsider with fresh eyes.',
  '🌿 Soft, stubborn, and slowly growing.',
  '✨ Innocence: uninstalled. Curiosity: still running.',
];

// ---------------- PROJECTS.md ----------------
const projects = readdirSync(new URL('src/content/projects/', root))
  .filter((f) => f.endsWith('.md'))
  .map((f) => frontmatter(read(`src/content/projects/${f}`)))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

const groups = [
  ['growing', '🌱 Growing', 'Being built right now.'],
  ['playable', '🎮 Playable', 'Running, and ready to play with.'],
  ['sleeping', '💤 Sleeping', 'Resting for now.'],
];

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');
let md = '### Projects\n\n' + bio.map((l) => l + '  ').join('\n') + '\n';
for (const [key, title, note] of groups) {
  const items = projects.filter((p) => p.status === key);
  if (!items.length) continue;
  md += `\n### ${title}\n\n${note}\n\n| Project | What it does | Demo | Source |\n|---|---|---|---|\n`;
  for (const p of items) {
    const name = `${p.icon} **${cell(p.name)}**${p.visibility === 'private' ? ' · Private' : ''}`;
    const what = cell(p.tagline) + (p.note ? ` <br>🔨 ${cell(p.note)}` : '') + (p.metric ? ` <br>${cell(p.metric)} (${cell(p.metricDate)})` : '');
    const demo = p.url ? `[Live](${p.url})` : '—';
    const src = p.repo ? `[GitHub](${p.repo})${p.visibility === 'private' ? ' (private)' : ''}` : '—';
    md += `| ${name} | ${what} | ${demo} | ${src} |\n`;
  }
}
md += '\n<sub>📍 Saigon · [Stack](STACK.md) · [Profile](README.md)</sub>\n';
writeFileSync(new URL('PROJECTS.md', root), md);

// ---------------- STACK.md ----------------
const stack = JSON.parse(read('src/data/stack.json'));
const utm = (url, slug) => {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'haphan.digital');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', 'stack');
  u.searchParams.set('utm_content', slug);
  return u.toString();
};
let s = '### Stack\n\nThe tools I use to build, publish and keep my garden growing.\n';
for (const g of stack) {
  const items = g.items.filter((i) => !i.confirm); // unconfirmed items stay hidden, same as the site
  if (!items.length) continue;
  s += `\n### ${g.icon} ${g.group}\n\n| Tool | How I use it |\n|---|---|\n`;
  for (const i of items) {
    const name = i.url ? `[${i.name}](${utm(i.url, i.slug)})` : i.name;
    s += `| ${i.icon} **${name}** | ${cell(i.how)} |\n`;
  }
}
s += `
### 🔄 How these fit together

Obsidian talks to n8n on my VPS through a private Tailscale tunnel, and n8n keeps ClickUp in sync. On the AI side, Cline in VS Code runs through 9Router to reach many models. (My own sketch, not a formal architecture.)

\`\`\`mermaid
flowchart LR
  O["🔮 Obsidian<br/>my vault"] -->|talks through| T["🕳️ Tailscale<br/>private tunnel"]
  T -->|reaches| N["🔗 n8n<br/>Docker · VPS"]
  N -->|syncs with| C["✅ ClickUp<br/>tasks"]
  subgraph AI ["The AI side"]
    direction LR
    CL["🛰️ Cline<br/>in VS Code"] -->|runs through| R["🧭 9Router<br/>one endpoint"]
    R -->|reaches| M["🧠 Many models"]
  end
\`\`\`

<sub>📍 Saigon · [Projects](PROJECTS.md) · [Profile](README.md)</sub>
`;
writeFileSync(new URL('STACK.md', root), s);
console.log(`PROJECTS.md (${projects.length} projects) and STACK.md written`);
