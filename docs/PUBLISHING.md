# How stories arrive

Banasthali Visibility OS (separate, private repo) writes one file per story into `posts/` through the GitHub Contents API. Every push to `main` triggers `.github/workflows/pages.yml`, which runs `node build.js` and deploys `dist/` to GitHub Pages.

## Story file format (`posts/<slug>.json`)
| Field | Type | Notes |
|---|---|---|
| slug | string | URL part; page is `/a/<slug>/` |
| title | string | headline |
| body | markdown | headings, lists, bold/italic, links, quotes. For `format: "poem"` line breaks are kept |
| audience | string | `parents`, `students`, `recruiters` (drives filter buttons) |
| format | string | `article`, `essay` or `poem` |
| metaDescription | string | card excerpt and article deck |
| faq | `[{q,a}]` | optional; rendered as a box plus FAQ markup |
| approvedAt / updatedAt | ISO date | newest first; shown in byline |
| sources | URLs | rendered under "Sources" and as citations |

Posts can also be added by hand: create a JSON file in `posts/` and commit.

## Removing a story
Delete its file from `posts/` (the OS does this when you reject an approved article).
