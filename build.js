// Banasthali Times — zero-dependency static site builder.  node build.js [--samples]
// Reads posts/*.json (written by Banasthali Visibility OS) and emits dist/: front page, article pages, rss, sitemap, robots, llms.txt.
import fs from 'node:fs';
import path from 'node:path';

const site = JSON.parse(fs.readFileSync('site.json', 'utf8'));
const URL_ = (process.env.SITE_URL || site.url || 'http://localhost:8080').replace(/\/$/, '');
const BASE = new URL(URL_).pathname.replace(/\/$/, '');
const dir = process.argv.includes('--samples') ? 'samples' : 'posts';
const OUT = 'dist';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const mins = (t) => Math.max(1, Math.round(String(t || '').split(/\s+/).length / 200));
const safeUrl = (u) => (/^https?:\/\//i.test(u) ? u : '#');

function md(src, poem) {
  if (poem) return '<div class="poem">' + esc(src).replace(/\n{2,}/g, '</div><div class="poem">').replace(/\n/g, '<br>') + '</div>';
  const inline = (t) => esc(t)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, a, u) => `<a href="${u}" rel="noopener">${a}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const out = []; let list = null, para = [];
  const flush = () => { if (para.length) out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; };
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of String(src || '').split('\n')) {
    const l = raw.trim(); let m;
    if (!l) { flush(); close(); continue; }
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) { flush(); close(); const n = Math.min(4, m[1].length + 1); out.push(`<h${n}>${inline(m[2])}</h${n}>`); }
    else if ((m = l.match(/^[-*]\s+(.*)/))) { flush(); if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = l.match(/^\d+[.)]\s+(.*)/))) { flush(); if (list !== 'ol') { close(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = l.match(/^>\s?(.*)/))) { flush(); close(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if (/^---+$/.test(l)) { flush(); close(); out.push('<hr>'); }
    else { close(); para.push(l); }
  }
  flush(); close(); return out.join('\n');
}

const CSS = `:root{--paper:#f6f1e3;--ink:#1b1a17;--mute:#55513f;--rule:#1b1a17;--card:#fbf8ef;--acc:#8a1c1c}
@media(prefers-color-scheme:dark){:root{--paper:#1c1b18;--ink:#ece7d8;--mute:#b8b19a;--rule:#ece7d8;--card:#24221e;--acc:#e0866f}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.7 Georgia,'Times New Roman',serif}
a{color:inherit}a:hover{color:var(--acc)}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}
.strip{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--rule);padding:8px 0;font:13px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.masthead{text-align:center;padding:18px 0 10px;border-bottom:4px double var(--rule)}
.masthead h1{margin:0;font:700 clamp(40px,8vw,84px)/1.05 Georgia,'Times New Roman',serif;letter-spacing:.02em;text-transform:uppercase}
.masthead h1 a{text-decoration:none}
.masthead p{margin:6px 0 0;font:italic 17px/1.4 Georgia,serif;color:var(--mute)}
nav.sections{display:flex;justify-content:center;gap:6px 22px;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid var(--rule);font:700 14px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase}
nav.sections button{background:none;border:0;border-bottom:2px solid transparent;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;padding:4px 2px;cursor:pointer}
nav.sections button.on,nav.sections button:hover{border-bottom-color:var(--acc);color:var(--acc)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;padding:28px 0 40px}
.card{background:var(--card);border:3px double var(--rule);padding:20px 22px;display:flex;flex-direction:column}
.card.lead{grid-column:span 2;padding:26px 30px}
.kicker{font:700 12px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin:0 0 8px}
.card h2{margin:0 0 8px;font:700 26px/1.2 Georgia,serif}.card.lead h2{font-size:clamp(30px,4vw,44px);line-height:1.12}
.card h2 a{text-decoration:none}
.by{font:13px/1.4 Arial,sans-serif;color:var(--mute);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:5px 0;margin:6px 0 12px}
.card p.ex{margin:0 0 14px;font-size:17px;line-height:1.65}
.more{margin-top:auto;font:700 13px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase}
.empty{padding:80px 0;text-align:center;font-style:italic;color:var(--mute)}
footer{border-top:4px double var(--rule);padding:22px 0 40px;font:14px/1.6 Arial,sans-serif;color:var(--mute);text-align:center}
/* article */
article.story{max-width:700px;margin:0 auto;padding:30px 0 50px}
article.story h1{font:700 clamp(32px,6vw,52px)/1.12 Georgia,serif;margin:6px 0 14px}
.deck{font:italic 21px/1.5 Georgia,serif;color:var(--mute);margin:0 0 14px}
.body{font-size:20px;line-height:1.8}
.body>p:first-of-type::first-letter{float:left;font:700 4.1em/.85 Georgia,serif;padding:6px 10px 0 0;color:var(--acc)}
.body h2,.body h3,.body h4{font-family:Georgia,serif;line-height:1.25;margin:1.6em 0 .4em}.body h2{font-size:28px}.body h3{font-size:23px}
.body a{text-decoration:underline;text-underline-offset:3px}
.body blockquote{margin:1.4em 0;padding:4px 0 4px 20px;border-left:4px solid var(--acc);font-style:italic}
.body ul,.body ol{padding-left:1.3em}.body li{margin:.3em 0}
.poem{text-align:center;font-style:italic;font-size:22px;line-height:1.9;margin:0 0 1.4em}
.box{border:3px double var(--rule);background:var(--card);padding:6px 22px 14px;margin:34px 0}
.box h2{font:700 15px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 6px}
.box h3{font:700 19px Georgia,serif;margin:14px 0 2px}.box p{margin:0 0 6px;font-size:18px}.box ul{margin:0;padding-left:1.2em;font:16px/1.7 Arial,sans-serif;word-break:break-word}
.back{font:700 13px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;text-decoration:none}
@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}.card.lead{grid-column:span 2}}
@media(max-width:600px){body{font-size:17px}.grid{grid-template-columns:1fr}.card.lead{grid-column:auto}.body{font-size:19px}}
@media print{nav.sections,.strip,footer{display:none}body{background:#fff;color:#000}}`;

const posts = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .filter((p) => p.slug && p.title && p.body).sort((a, b) => String(b.approvedAt || '').localeCompare(String(a.approvedAt || ''))) : [];
const link = (p) => `${BASE}/${p}`;
const abs = (p) => URL_ + p;
const org = { '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: site.name, url: abs('/'), description: site.tagline, publisher: { '@type': 'CollegeOrUniversity', name: 'Banasthali Vidyapith', url: site.officialSite, sameAs: site.sameAs } };

function page({ title, desc, body, ld = [], p, type = 'website' }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(abs(p))}"><link rel="alternate" type="application/rss+xml" href="${link('rss.xml')}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="${esc(site.name)}"><style>${CSS}</style>${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('')}</head><body>${body}</body></html>`;
}
const head = (small) => `<div class="wrap"><div class="strip"><span>${esc(day(new Date()))}</span><span>Banasthali Vidyapith · Rajasthan, India</span><span>Price: always free</span></div><header class="masthead"><h1><a href="${link('')}/">${esc(site.name)}</a></h1>${small ? '' : `<p>${esc(site.tagline)}</p>`}</header></div>`;
const foot = `<footer><div class="wrap">${esc(site.name)} publishes source-checked stories about Banasthali Vidyapith. Official site: <a href="${esc(safeUrl(site.officialSite))}">${esc(site.officialSite)}</a> · <a href="${link('rss.xml')}">RSS</a> · <a href="${link('llms.txt')}">llms.txt</a></div></footer>`;

function card(p, i) {
  return `<article class="card${i === 0 ? ' lead' : ''}" data-a="${esc(p.audience || '')}"><div class="kicker">${esc(p.audience || 'General')} · ${esc(p.format || 'article')}</div><h2><a href="${link(`a/${esc(p.slug)}/`)}">${esc(p.title)}</a></h2><div class="by">By the Banasthali Vidyapith Desk · ${esc(day(p.approvedAt))} · ${mins(p.body)} min read</div><p class="ex">${esc(p.metaDescription || String(p.body).replace(/[#*_>\[\]()`]/g, '').slice(0, 200) + '…')}</p><a class="more" href="${link(`a/${esc(p.slug)}/`)}">Read the full story →</a></article>`;
}
function front() {
  const aud = [...new Set(posts.map((p) => p.audience).filter(Boolean))];
  const nav = aud.length > 1 ? `<nav class="sections"><button class="on" data-f="">All stories</button>${aud.map((a) => `<button data-f="${esc(a)}">${esc(a)}</button>`).join('')}</nav>` : '';
  const js = `<script>document.querySelectorAll('nav.sections button').forEach(function(b){b.onclick=function(){document.querySelectorAll('nav.sections button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');var f=b.dataset.f,first=true;document.querySelectorAll('.card').forEach(function(c){var show=!f||c.dataset.a===f;c.style.display=show?'':'none';c.classList.toggle('lead',show&&first);if(show)first=false})}})</script>`;
  const list = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: site.name, url: abs('/'), mainEntity: { '@type': 'ItemList', itemListElement: posts.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/a/${p.slug}/`), name: p.title })) } };
  return page({ title: `${site.name} — ${site.tagline}`, desc: site.tagline, p: '/', ld: [org, list],
    body: `${head(false)}${nav ? `<div class="wrap">${nav}</div>` : ''}<main class="wrap">${posts.length ? `<div class="grid">${posts.map(card).join('')}</div>` : '<div class="empty">The first edition is being prepared. Check back soon.</div>'}</main>${foot}${nav ? js : ''}` });
}
function story(p) {
  const faq = Array.isArray(p.faq) ? p.faq.filter((f) => f.q && f.a) : [];
  const src = (p.sources || []).filter((u) => /^https?:\/\//.test(u));
  const mod = p.updatedAt || p.approvedAt;
  const ld = [{ '@context': 'https://schema.org', '@type': p.format === 'poem' ? 'CreativeWork' : 'Article', headline: p.title, description: p.metaDescription || '', datePublished: p.approvedAt, dateModified: mod, inLanguage: 'en', mainEntityOfPage: abs(`/a/${p.slug}/`), author: { '@type': 'Organization', name: 'Banasthali Vidyapith Desk' }, publisher: org.publisher, isPartOf: org, citation: src, about: { '@type': 'CollegeOrUniversity', name: 'Banasthali Vidyapith' } }];
  if (faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const body = `${head(true)}<main class="wrap"><article class="story"><a class="back" href="${link('')}/">← All stories</a><div class="kicker" style="margin-top:22px">${esc(p.audience || 'General')} · ${esc(p.format || 'article')}</div><h1>${esc(p.title)}</h1>${p.metaDescription ? `<p class="deck">${esc(p.metaDescription)}</p>` : ''}<div class="by">By the Banasthali Vidyapith Desk · ${esc(day(p.approvedAt))} · ${mins(p.body)} min read${mod && mod !== p.approvedAt ? ` · Updated ${esc(day(mod))}` : ''}</div><div class="body">${md(p.body, p.format === 'poem')}</div>${faq.length ? `<section class="box"><h2>Frequently asked</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>` : ''}${src.length ? `<section class="box"><h2>Sources</h2><ul>${src.map((u) => `<li><a href="${esc(u)}" rel="noopener">${esc(u)}</a></li>`).join('')}</ul></section>` : ''}</article></main>${foot}`;
  return page({ title: `${p.title} — ${site.name}`, desc: p.metaDescription || p.title, body, ld, p: `/a/${p.slug}/`, type: 'article' });
}

fs.rmSync(OUT, { recursive: true, force: true });
const w = (f, t) => { const x = path.join(OUT, f); fs.mkdirSync(path.dirname(x), { recursive: true }); fs.writeFileSync(x, t); };
w('index.html', front());
for (const p of posts) w(`a/${p.slug}/index.html`, story(p));
w('404.html', page({ title: `Page not found — ${site.name}`, desc: 'Page not found', p: '/404', body: `${head(true)}<main class="wrap"><div class="empty">That page is not in this edition. <a href="${link('')}/">Back to the front page</a></div></main>${foot}` }));
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(abs('/'))}</loc></url>${posts.map((p) => `<url><loc>${esc(abs(`/a/${p.slug}/`))}</loc><lastmod>${esc(String(p.updatedAt || p.approvedAt || '').slice(0, 10))}</lastmod></url>`).join('')}</urlset>`);
w('rss.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><link>${esc(abs('/'))}</link><description>${esc(site.tagline)}</description>${posts.slice(0, 30).map((p) => `<item><title>${esc(p.title)}</title><link>${esc(abs(`/a/${p.slug}/`))}</link><guid>${esc(abs(`/a/${p.slug}/`))}</guid><pubDate>${new Date(p.approvedAt || Date.now()).toUTCString()}</pubDate><description>${esc(p.metaDescription || '')}</description></item>`).join('')}</channel></rss>`);
w('robots.txt', `User-agent: *\nAllow: /\n\n${['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot', 'Amazonbot', 'Meta-ExternalAgent'].map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n\nSitemap: ${abs('/sitemap.xml')}\n`);
w('llms.txt', `# ${site.name}\n\n> ${site.tagline}. Official site: ${site.officialSite}\n\n## Stories\n${posts.map((p) => `- [${p.title}](${abs(`/a/${p.slug}/`)}): ${p.metaDescription || ''}`).join('\n')}\n`);
console.log(`Built ${posts.length} stories from ${dir}/ → ${OUT}/  (base "${BASE}")`);
