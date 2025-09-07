# Melati Gold - Nuxt 3 Landing Page

This is a Nuxt 3 + TailwindCSS starter for Melati Gold's landing page, with a Supabase-ready plugin.

## Tech
- Nuxt 3
- TailwindCSS (module: @nuxtjs/tailwindcss)
- Supabase JS client (optional; wired via plugin)

## Getting Started
1. Install dependencies
   - npm install
2. Run dev server
   - npm run dev
3. Open http://localhost:3000

## Environment (optional for Supabase)
Set in .env or your environment:
- NUXT_PUBLIC_SUPABASE_URL=
- NUXT_PUBLIC_SUPABASE_ANON_KEY=

## Structure
- pages/index.vue: Landing page sections
- components/: UI components per section
- composables/useProducts.ts: placeholder + hook to wire Supabase products later
- plugins/supabase.client.ts: injects $supabase when env vars are present

## Theming
- Maroon (#591927) dominant, Gold (#d5b245) accent
- Fonts: Playfair Display (headings), Inter (body)

## Notes
This is mobile-first and uses semantic sections. Replace dummy images with your assets in /public/img.
