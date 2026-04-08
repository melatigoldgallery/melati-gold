# Melati Gold Shop — Copilot Instructions

Proyek ini adalah **toko perhiasan emas** (Melati Gold Shop) berbasis web statis yang dibangun di atas Nuxt 3, dengan Supabase sebagai backend dan Netlify sebagai hosting.

## Stack

| Layer     | Teknologi                                                              |
| --------- | ---------------------------------------------------------------------- |
| Framework | Nuxt 3 (SSR: false, output: static)                                    |
| Language  | TypeScript + Vue 3 Composition API                                     |
| Styling   | Tailwind CSS (custom tokens: `maroon`, `gold`, `cream`)                |
| Backend   | Supabase (PostgreSQL + Auth)                                           |
| Media     | ImageKit (upload, optimasi, transformasi)                              |
| Icon      | `@heroicons/vue` (outline/solid) + Bootstrap Icons (CDN via `bi bi-*`) |
| Animasi   | AOS (scroll), motion-v (transitions)                                   |
| Deploy    | Netlify                                                                |

## Arsitektur

```
nuxt-melati/
├── pages/          # File-based routing; dynamic: [id].vue, [category].vue
├── components/     # Auto-imported, PascalCase; admin/, catalog/, ui/, sections/, product/, layout/
├── composables/    # Auto-imported; auth/, catalog/, media/, pricing/, shared/
├── constants/      # Auto-imported; ROUTES, TABLES, CACHE_KEYS — SCREAMING_SNAKE_CASE
├── layouts/        # default.vue, admin.vue
├── middleware/     # auth.ts (proteksi semua route), supervisor-only.ts
├── server/api/     # Nitro routes: imagekit/auth.get.ts, imagekit/delete.post.ts
├── types/          # catalog.ts, product.ts, supabase.ts (generated)
└── database/       # schema.sql, seed.sql (PostgreSQL + Supabase)
```

## Naming Conventions

- **Komponen Vue**: `PascalCase.vue` — `CatalogProductModal.vue`, `ProductGallery.vue`
- **Composables**: `useCamelCase.ts` — `useCatalogManager.ts`, `useImageKit.ts`
- **Constants** (export): `SCREAMING_SNAKE_CASE` — `ROUTES.HOME`, `TABLES.PRODUCTS`
- **Variables & functions**: `camelCase`
- **Database tables/columns**: `snake_case` — `catalog_products`, `is_featured`, `display_order`
- **Routes/pages/files**: `kebab-case` — `/admin/catalog`, `supervisor-only.ts`
- **Plugins client-only**: suffix `.client.ts` — `aos.client.ts`

## Composable Patterns

**Selalu gunakan composable yang sudah ada, bukan panggil Supabase langsung dari komponen.**

```ts
// ✅ Benar
const { getProducts, createProduct } = useCatalogManager()
const { login, logout, isAuthenticated } = useAuth()
const { optimizeUrl } = useImageOptimization()

// ❌ Hindari
const { $supabase } = useNuxtApp()
await $supabase.from('catalog_products').select(...)
```

**State management**: gunakan `useState` (Nuxt, SSR-safe) untuk state global; `ref`/`reactive` untuk state lokal komponen. Tidak ada Pinia.

**Async data di pages**:

```ts
const { data, status, error } = useAsyncData(
  () => `cache-key-${id.value}`,          // key reaktif
  async () => { ... return data },
  { watch: [id] }                          // re-fetch otomatis saat param berubah
)
```

**Cache**: gunakan `useCacheManager` untuk data yang jarang berubah (kategori, layanan).

## Routing

Selalu gunakan konstanta dari `~/constants/routes.ts`:

```ts
import { ROUTES } from '~/constants/routes'
navigateTo(ROUTES.PRODUCT(id))
<NuxtLink :to="ROUTES.CATALOG('cincin')">
```

Middleware:

- `auth` — semua halaman `/dashboard`, `/admin/**`
- `supervisor-only` — halaman khusus supervisor

## UI & Styling

**Custom Tailwind color tokens** — wajib digunakan, bukan hardcode warna:

```html
<!-- ✅ Benar -->
<div class="bg-cream text-maroon">
  <button class="bg-maroon hover:bg-maroon/90 text-white">
    <span class="text-gold font-serif">
      <!-- ❌ Hindari -->
      <div class="bg-[#FAF7F2]">
        <button class="bg-[#591927]"></button>
      </div>
    </span>
  </button>
</div>
```

**Font usage**:

- `font-serif` (Playfair Display) → heading/judul
- `font-sans` (Poppins) → body/default
- `font-script` (Allura) → dekoratif/branding

**Layout container standar**:

```html
<div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"></div>
```

**Product grid standar** (responsif):

```html
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"></div>
```

## Komponen & Template

- Selalu gunakan `<script setup lang="ts">` (tidak perlu `export default`)
- Import type dengan `import type { ... } from '~/types/catalog'`
- Gunakan `definePageMeta({ layout: 'admin' })` untuk halaman admin
- Gunakan `definePageMeta({ layout: false })` bila halaman kelola sendiri layout-nya
- Navigasi dengan `<NuxtLink>`, bukan `<a href>`
- Gambar dengan `<NuxtImg>` atau ImageKit URL yang sudah dioptimasi
- Notifikasi dengan `useToast()` dari `~/composables/shared/useToast.ts`

## Database

- **Jangan modifikasi** `types/supabase.ts` secara manual — file ini di-generate oleh Supabase CLI
- Gunakan views yang sudah ada: `v_catalog_products_full`, `v_featured_products`, `v_best_sellers`
- Semua mutation (insert/update/delete) harus melalui composable di `composables/catalog/useCatalogManager.ts`
- Slug produk dan kategori harus unik; ada helper `ensureUniqueProductSlug()` di composable

## Server API (Nitro)

- Routes di `server/api/` hanya untuk operasi yang butuh secret (ImageKit auth, delete file)
- Konvensi nama: `server/api/<resource>/<action>.<method>.ts`
- Validasi input wajib di semua POST handler sebelum proses

## ImageKit

- URL gambar menggunakan transformasi ImageKit langsung di template: `?tr=w-400,h-400,fo-auto`
- Untuk upload, gunakan `useImageKit()` yang sudah memiliki endpoint auth ke `/api/imagekit/auth`
- Hapus file lama saat update produk (via `/api/imagekit/delete-by-url`)

## Hal yang Tidak Perlu Dilakukan

- Jangan tambah Pinia/Vuex — state management sudah cukup dengan composable + useState
- Jangan buat route handler baru kecuali perlu akses server-side secret
- Jangan panggil Supabase langsung dari komponen — harus lewat composable
- Jangan ubah `schema.sql` tanpa migrasi yang jelas
- Jangan hardcode URL ImageKit atau Supabase — gunakan `useRuntimeConfig()` atau env variable
