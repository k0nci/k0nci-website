# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

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

`ci` triggers on pushes and PRs to main. Checks: typecheck, lint, format:check.

## Architecture

- **Astro SSG** with static output deployed as Cloudflare Workers static assets (`wrangler.jsonc`)
- **Tailwind CSS v4** integrated via Vite plugin in `astro.config.ts` (not PostCSS, no `tailwind.config.js`)
- **astro-icon** with Iconify icon sets (`@iconify-json/cib` for brands, `@iconify-json/ph` for Phosphor icons)
- Site URL configurable via `SITE_URL` env var (defaults to `https://k0nci.me`)
- ESLint flat config with `typescript-eslint` type-checked rules and `eslint-plugin-astro`
- Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`

## Project Structure

- `src/pages/` — file-based routing; `index.astro` (homepage), `robots.txt.ts` (dynamic robots.txt)
- `src/layouts/BaseLayout.astro` — root HTML layout with meta tags and OG data
- `src/components/content/` — content components (HeroTitle, TechStack, ActivityIcons, SocialLinks)
- `src/components/background/` — visual effects (TwinklingStars, MountainLayers, AuroraBackground)
- `src/types/index.ts` — shared TypeScript interfaces (PersonalInfo, ActivityItem, SocialLink)
- `src/styles/global.css` — single `@import 'tailwindcss'` entry point
- `public/` — static assets (og-image.png)

## Key Patterns

- **No CMS/database** — all content (personal info, tech tags, social links) is defined as typed objects in `index.astro`
- **SEO** — JSON-LD structured data (ProfilePage/Person via `schema-dts`) in `index.astro`, sitemap via `@astrojs/sitemap`
- **Path aliases** — `@components/*` and `@layouts/*` configured in `tsconfig.json`
- **Component-scoped animations** — CSS keyframes (fadeInUp, twinkle) in component `<style>` blocks, not global
- **Z-index layering** — background(0) → mountains(10) → content(20) → copyright(30)
