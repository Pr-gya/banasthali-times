# Banasthali Times

A retro-newspaper blog for verified stories about Banasthali Vidyapith. Static site (no server, no dependencies), hosted free on GitHub Pages. Stories are posted here automatically by **Banasthali Visibility OS** when you press *Approve & publish* in its Content Studio.

## Features
- Newspaper front page: lead story plus boxed cards, audience filters (parents / students / recruiters)
- Readability first: high-contrast type, 20px article text, 700px column, drop cap, light and dark modes, print layout
- Search and AI friendly: static HTML, article and FAQ markup, sitemap, RSS, `robots.txt`, `llms.txt`

## Repository layout
```
site.json                      name, tagline, official site, social links
build.js                       static site generator (Node 18+, no dependencies)
posts/                         one JSON file per story (written by the OS)
samples/                       placeholder stories for local layout preview only
docs/PUBLISHING.md             story file format and how posts arrive
.github/workflows/pages.yml    builds and deploys to GitHub Pages on every push
```

## Quick start
```bash
npm run preview      # builds dist/ from samples/ - open dist/index.html
npm run build        # builds dist/ from posts/
```

## Deploy (once)
1. Repository must be **public** (GitHub Pages on free plans needs a public repo).
2. Settings → Pages → Source: **GitHub Actions**.
3. Actions → run **Publish Banasthali Times**. Site: `https://<username>.github.io/banasthali-times/`.
4. Connect the OS: create a fine-grained token (only this repo, *Contents: Read and write*) and set `TIMES_GITHUB_REPO`, `TIMES_GITHUB_TOKEN`, `TIMES_URL` in the OS `.env`. See `docs/BANASTHALI_TIMES.md` in the OS repo.

Custom domain: Settings → Pages, then add repository variable `SITE_URL`.
