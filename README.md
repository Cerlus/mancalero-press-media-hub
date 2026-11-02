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
- `assets/social/`: vertical social clips (with poster JPGs)
- `assets/clips/`: 16:9 marble showcase clips
- `assets/loops/`: short gameplay loops (MP4; GIF copies in `assets/gifs/`)
- `assets/marbles/`: selected marble reference icons for the public gallery
- `assets/press-kit/`: downloadable ZIP and fact sheet
- `assets/downloads/`: creator-friendly B-roll ZIP
- `assets/branding/`: key art, the complete native-size Steam capsule suite, and branding guide
- `Mancalero_Applications_Record.md`: confirmed showcase applications/registrations and clearly separated preparation status

**Launch update (2026-11-02):** the Media section now leads with the launch trailer (`assets/trailers/mancalero-launch-trailer-november-2026.mp4`), then the newest vertical social clips (`assets/social/`), the marble showcase clips (`assets/clips/`), the eight Steam-page gameplay loops (`assets/loops/` MP4 + `assets/gifs/` GIF), the ten launch-build screenshots (`assets/screenshots/launch/`) and the OUT NOW capsule art (`assets/branding/out-now/`). The demo-era trailers, the old GIFs and the old screenshots were removed on 2026-11-02 (Steam Next Fest is done). The deploy workflow zips only the current set (press kit: art, logos, launch screenshots, launch trailer; B-roll: launch trailer, showcase clips, loops) to keep the published site under GitHub Pages' 1 GB limit.

The current set: the launch trailer, twelve vertical social clips, five marble showcase clips, eight gameplay loops (MP4 + GIF), ten launch-build screenshots, the official key art, the full Steam capsule suite with OUT NOW variants, logos, and selected marble icons. Mancalero launches November 4, 2026 on Steam; the free demo is live and took part in Steam Next Fest (October 19–26, 2026). The page uses the game's own fonts (Press Start 2P and VT323), self-hosted in `assets/fonts/`. The public press contact is `needle-blares.0m@icloud.com`, and the social hub is https://linktr.ee/archiusdev.

## Relationship to the Command Center

The Launch Command Center remains the private operational dashboard. This site is the public source for press, creators, showcases, festivals, and other external contacts. The public hub does not link to the private dashboard; use the public press contact above for external inquiries.
