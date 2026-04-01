# Struktur Folder Project nuxt-melati

> Dokumen ini menjelaskan struktur folder aktual setelah refactoring selesai, penjelasan per folder, konvensi penamaan, dan status roadmap.

---

## Daftar Isi

- [Struktur Aktual](#struktur-aktual)
- [Penjelasan Per Folder](#penjelasan-per-folder)
- [Konvensi Penamaan](#konvensi-penamaan)
- [Roadmap Refactoring](#roadmap-refactoring)

---

## Struktur Aktual

```
nuxt-melati/
├── app.vue
├── nuxt.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── assets/css/tailwind.css
│
├── components/
│   ├── layout/              ← komponen kerangka halaman
│   │   ├── SiteHeader.vue
│   │   └── SiteFooter.vue
│   ├── sections/            ← blok konten halaman beranda
│   │   ├── HeroSection.vue
│   │   ├── AboutUs.vue
│   │   ├── CatalogShowcase.vue
│   │   ├── FeaturedProducts.vue
│   │   ├── CustomServices.vue
│   │   ├── Testimonials.vue
│   │   ├── CareTips.vue
│   │   └── FinalCta.vue
│   ├── ui/                  ← komponen generik & reusable
│   │   ├── AppToast.vue
│   │   ├── AppPagination.vue
│   │   ├── ImageCarousel.vue
│   │   └── ImageKitUploader.vue
│   ├── catalog/             ← komponen halaman katalog publik
│   │   ├── FilterSidebar.vue
│   │   └── ProductGrid.vue
│   ├── product/             ← komponen halaman detail produk
│   │   ├── ProductGallery.vue
│   │   ├── ProductInfo.vue
│   │   ├── ProductContactButtons.vue
│   │   └── RelatedProducts.vue
│   └── admin/
│       ├── pricing/
│       │   ├── GoldPriceManager.vue
│       │   └── KaratConfigManager.vue
│       └── catalog/
│           ├── CatalogBestSellerManager.vue
│           ├── CatalogCategoryManager.vue
│           ├── CatalogCategoryModal.vue
│           ├── CatalogFeaturedManager.vue
│           ├── CatalogProductManager.vue
│           ├── CatalogProductModal.vue
│           ├── CatalogServiceManager.vue
│           ├── CatalogServiceModal.vue
│           ├── CatalogSubcategoryManager.vue
│           └── CatalogSubcategoryModal.vue
│
├── composables/
│   ├── auth/useAuth.ts
│   ├── catalog/useCatalogManager.ts
│   ├── pricing/
│   │   ├── useGoldPricing.ts
│   │   └── useKaratConfig.ts
│   ├── media/
│   │   ├── useImageKit.ts
│   │   └── useImageOptimization.ts
│   └── shared/
│       ├── useCacheManager.ts
│       └── useToast.ts
│
├── constants/
│   ├── gold.ts
│   ├── routes.ts            ← ROUTES — dipakai di middleware & pages
│   └── supabase.ts          ← TABLES, VIEWS, CACHE_KEYS — dipakai di composables
│
├── database/
│   ├── schema.sql           ← DDL + fungsi + RLS + views (jalankan pertama)
│   ├── seed.sql             ← data default (jalankan kedua)
│   └── link_users_to_auth.sql ← setup manual Supabase Auth
│
├── doc/
│   ├── PROJECT_STRUCTURE.md
│   └── MIGRASI_IMAGEKIT.md
│
├── layouts/
│   ├── default.vue
│   └── admin.vue            ← layout khusus panel admin
│
├── middleware/
│   ├── auth.ts
│   └── supervisor-only.ts
│
├── pages/
│   ├── index.vue
│   ├── login.vue
│   ├── dashboard.vue
│   ├── admin/
│   │   ├── catalog.vue
│   │   └── users.vue
│   ├── catalog/[category].vue
│   ├── product/[id].vue
│   └── service/[id].vue
│
├── plugins/
│   ├── aos.client.ts
│   ├── reveal.client.ts
│   ├── supabase.client.ts
│   └── z-supabase-auth.client.ts
│
├── public/img/logo.png
│
├── server/api/imagekit/
│   ├── auth.get.ts
│   ├── delete.post.ts
│   └── delete-by-url.post.ts
│
└── types/
    ├── aos.d.ts
    ├── catalog.ts
    ├── product.ts
    └── supabase.ts          ← generated via Supabase CLI (npm run gen:types)
```

---

## Penjelasan Per Folder

### `components/`

| Subfolder   | Isi                                           | Prinsip                                  |
| ----------- | --------------------------------------------- | ---------------------------------------- |
| `ui/`       | Toast, Pagination, Uploader, Carousel         | Tanpa logika bisnis, sepenuhnya reusable |
| `layout/`   | SiteHeader, SiteFooter                        | Kerangka halaman                         |
| `sections/` | Hero, AboutUs, CatalogShowcase, dsb.          | Hanya dipakai di `pages/index.vue`       |
| `catalog/`  | FilterSidebar, ProductGrid                    | Khusus halaman katalog publik            |
| `product/`  | ProductGallery, ProductInfo, RelatedProducts  | Khusus halaman detail produk             |
| `admin/`    | Manager & modal per domain (catalog, pricing) | Tidak pernah dipakai di halaman publik   |

### `composables/`

| Subfolder  | Composable                            | Tanggung Jawab                 |
| ---------- | ------------------------------------- | ------------------------------ |
| `auth/`    | `useAuth`                             | Session, login, logout, role   |
| `catalog/` | `useCatalogManager`                   | CRUD produk, kategori, layanan |
| `pricing/` | `useGoldPricing`, `useKaratConfig`    | Harga emas & konfigurasi karat |
| `media/`   | `useImageKit`, `useImageOptimization` | Upload & optimasi gambar       |
| `shared/`  | `useCacheManager`, `useToast`         | Utilitas lintas fitur          |

### `constants/`

Auto-import via `nuxt.config.ts` (`imports.dirs: ["constants"]`) — tidak perlu import manual.

```ts
// constants/routes.ts — navigasi konsisten tanpa hardcoded string
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CATALOG: (category: string) => `/catalog/${category}`,
  PRODUCT: (id: string) => `/product/${id}`,
  SERVICE: (id: string) => `/service/${id}`,
  ADMIN: { CATALOG: "/admin/catalog", USERS: "/admin/users" },
} as const;

// constants/supabase.ts — nama tabel/view terpusat, dipakai di semua composable
export const TABLES = {
  PRODUCTS: "catalog_products",
  CATEGORIES: "catalog_categories",
  // ...
} as const;
```

### `database/`

Urutan eksekusi pada project Supabase baru:

```
1. schema.sql             — DDL: tabel, index, fungsi, RLS, views
2. seed.sql               — data default
3. link_users_to_auth.sql — manual, butuh UUID dari Supabase Auth
```

---

## Konvensi Penamaan

| Konteks          | Konvensi                 | Contoh                             |
| ---------------- | ------------------------ | ---------------------------------- |
| Komponen Vue     | PascalCase               | `ProductGrid.vue`, `AppButton.vue` |
| Composable       | camelCase + prefix `use` | `useGoldPricing.ts`                |
| Constants        | SCREAMING_SNAKE_CASE     | `export const MAX_PRICE = 999999`  |
| Types/Interfaces | PascalCase               | `interface ProductCategory {}`     |
| Folder           | kebab-case               | `admin/`, `catalog/`, `ui/`        |

---

## Roadmap Refactoring

### Fase 1 — Organisasi Komponen ✅ Selesai

- [x] Pindahkan section components → `components/sections/`
- [x] Pindahkan `ToastNotification.vue` → `components/ui/AppToast.vue`
- [x] Pindahkan `ImageKitUploader.vue` → `components/ui/`
- [x] Pindahkan `PaginationControls.vue` → `components/ui/AppPagination.vue`
- [x] Pindahkan `ProductContactButtons.vue` → `components/product/`
- [x] Pindahkan `SiteHeader.vue` & `SiteFooter.vue` → `components/layout/`
- [x] Pindahkan `GoldPriceManager.vue` & `KaratConfigManager.vue` → `components/admin/pricing/`

### Fase 2 — Organisasi Composable ✅ Selesai

- [x] Buat subfolder domain di `composables/`
- [x] Pindahkan composable sesuai domain
- [x] Update `nuxt.config.ts` agar auto-import dari semua subdirektori

### Fase 3 — Constants & Types ✅ Selesai

- [x] Buat `constants/routes.ts`, `constants/gold.ts`, `constants/supabase.ts`
- [x] Integrasikan `ROUTES` ke middleware & pages
- [x] Integrasikan `TABLES`/`VIEWS` ke semua composable
- [x] Tambah `types/catalog.ts`, `types/product.ts`
- [x] Generate `types/supabase.ts` via Supabase CLI (`npm run gen:types`)

### Fase 4 — Database ✅ Selesai

- [x] Konsolidasi 13 file SQL → 3 file (`schema.sql`, `seed.sql`, `link_users_to_auth.sql`)
- [x] Hapus file migration & schema yang sudah tidak diperlukan

### Fase 5 — Layout Admin ✅ Selesai

- [x] Buat `layouts/admin.vue`
- [x] Update `pages/admin/*.vue` & `pages/dashboard.vue` untuk menggunakan layout admin

---

> **Catatan:** Semua composable dan constants di-auto-import oleh Nuxt — tidak perlu `import` manual di `.vue` atau `.ts` manapun.
