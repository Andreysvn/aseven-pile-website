import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://asevenpile.com', // Ganti dengan domain asli nanti
  output: 'static',
  redirects: {
    '/portofolio': '/galeri',
    '/layanan/bore-pile-mesin/diameter-30cm': '/layanan/bore-pile/diameter/30/',
    '/layanan/bore-pile-mesin/diameter-40cm': '/layanan/bore-pile/diameter/40/',
    '/layanan/bore-pile-mesin/diameter-50cm': '/layanan/bore-pile/diameter/50/',
    '/layanan/bore-pile-mesin/diameter-60cm': '/layanan/bore-pile/diameter/60/',
    '/layanan/bore-pile-mesin/diameter-80cm': '/layanan/bore-pile/diameter/80/',
    '/layanan/strauss-pile/diameter-30cm': '/layanan/strauss-pile/diameter/30/',
  },
  build: {
    inlineStylesheets: 'always'
  },
  integrations: [
    sitemap()
  ]
});
