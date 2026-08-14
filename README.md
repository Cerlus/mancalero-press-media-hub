# Mancalero Press & Media Hub

Public-facing companion to the Mancalero Launch Command Center. The visual language follows the existing private dashboard and the game itself: warm paper, navy ink, serif display type, compact uppercase labels, colored edge accents, and a marble rail motif. The hub also includes a small, restartable 2D browser round against Sprout with pits, stores, scoring, captures, extra turns, and synthesized SFX.

## GitHub Pages setup

1. Create a GitHub repository, suggested name: `mancalero-press-media-hub`.
2. Upload this folder to the repository's `main` branch.
3. In GitHub, open **Settings > Pages** and choose **GitHub Actions** as the source.
4. The included workflow deploys the site on every push to `main`.
5. Your free public URL is `https://cerlus.github.io/mancalero-press-media-hub/`.

## Custom domain

The custom domain is optional and requires owning a domain. If you later purchase `archius.dev`, add this record at its DNS provider:

| Type | Host | Target |
| --- | --- | --- |
| CNAME | `press` | `<github-username>.github.io` |

Then add `press.archius.dev` under **Settings > Pages > Custom domain**. GitHub will issue HTTPS after DNS resolves. Until then, use the free GitHub Pages URL above.

## Add the missing media

- `assets/screenshots/`: final screenshots
- `assets/gifs/`: short gameplay GIFs
- `assets/logos/`: logo files and transparent marks
- `assets/trailers/`: local trailer and B-roll files
- `assets/press-kit/`: downloadable ZIP and fact sheet
- `assets/downloads/`: creator-friendly B-roll ZIP
- `assets/branding/`: key art, capsule art, and branding guide

The supplied capsule art, logos, screenshots, GIFs, gameplay clips, official YouTube trailer, press-kit ZIP, and creator B-roll ZIP are included. The browser round uses native HTML, CSS, JavaScript, and Web Audio so the site remains a no-build GitHub Pages deployment. The public press contact is `needle-blares.0m@icloud.com`.

## Relationship to the Command Center

The Launch Command Center remains the private operational dashboard. This site is the public source for press, creators, showcases, festivals, and other external contacts. The footer links back to the dashboard without exposing private planning content.
