import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://k0nci.me',
  integrations: [react(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Local agent worker (`npm run dev` in k0nci-agent). Production routes /api/chat at the edge.
      proxy: { '/api': 'http://localhost:8787' },
    },
  },
});
