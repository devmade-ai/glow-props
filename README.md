# glow-props

A static file host deployed via GitHub Pages. Serves fetchable config files — like `CLAUDE.md` — so Claude Code sessions across any project can pull shared rules from a single URL.

## How It Works

1. Files in this repo are deployed to GitHub Pages automatically on push to `main`.
2. Any file becomes fetchable at `https://devmade-ai.github.io/glow-props/<path>`.

## Hosted Files

| File | URL | Purpose |
|------|-----|---------|
| `CLAUDE.md` | `https://devmade-ai.github.io/glow-props/CLAUDE.md` | Global AI assistant rules (process, principles, code standards, documentation, prohibitions) |

## Adding Files

1. Add any `.md`, `.txt`, or other static file to the repo root or a subdirectory.
2. Push to `main`.
3. Access it at `https://devmade-ai.github.io/glow-props/<path>`.

## Deployment

Automated via GitHub Actions. The workflow at `.github/workflows/deploy.yml` deploys to GitHub Pages on every push to `main`.

**Setup:** In repo Settings > Pages, set the source to **GitHub Actions**.
