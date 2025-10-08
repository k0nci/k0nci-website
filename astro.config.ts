import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://k0nci.me',
  integrations: [sitemap(), icon()],
  vite: {
    // @ts-expect-error - Tailwind CSS Vite plugin type mismatch with latest Vite
    // Reference: https://github.com/tailwindlabs/tailwindcss/issues/18002
    plugins: [tailwindcss()],
  },
});
