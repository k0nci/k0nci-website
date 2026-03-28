# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `website/`:

```bash
npm install        # install dependencies
npm run dev        # dev server at localhost:4321
npm run build      # production build (output: dist/)
npm run preview    # preview production build
npm run typecheck  # astro check (type checking)
npm run lint       # eslint
npm run lint:fix   # eslint with auto-fix
npm run format:check  # prettier check
npm run format     # prettier write
```

## CI

`website-ci` triggers on `website/**` changes. Checks: typecheck, lint, format:check (Node 22).

## Architecture

- **Astro SSG** with static output deployed as Cloudflare Workers static assets (`wrangler.jsonc`)
- **Tailwind CSS v4** integrated via Vite plugin (not PostCSS)
- **astro-icon** with Iconify icon sets (`@iconify-json/cib`, `@iconify-json/ph`)
- Site URL configurable via `SITE_URL` env var (defaults to `https://k0nci.me`)
- ESLint uses flat config with `typescript-eslint` type-checked rules and `eslint-plugin-astro`
