---
description: "Gunakan instruksi ini saat bekerja dengan katalog produk, kategori, subkategori, atau layanan custom di Melati Gold Shop. Berlaku untuk komponen admin catalog, halaman catalog/product/service, dan composable useCatalogManager."
applyTo: "nuxt-melati/components/admin/catalog/**,nuxt-melati/pages/catalog/**,nuxt-melati/pages/product/**,nuxt-melati/pages/service/**,nuxt-melati/composables/catalog/**"
---

# Katalog — Melati Gold Shop

Instruksi spesifik untuk fitur katalog. Lihat `.github/copilot-instructions.md` untuk konvensi global project.

## Entitas Katalog

| Entitas     | Tabel                   | Catatan                                                            |
| ----------- | ----------------------- | ------------------------------------------------------------------ |
| Kategori    | `catalog_categories`    | Memiliki `slug`, `is_active`, `display_order`, `cover_image`       |
| Subkategori | `catalog_subcategories` | Selalu ada `category_id` (FK)                                      |
| Produk      | `catalog_products`      | Slug unik; `images` adalah array; ada `karat_type`, `weight_grams` |
| Layanan     | `custom_services`       | Memiliki `features` (array text), `duration`, `price_info`         |

## Semua Operasi CRUD Lewat Composable

```ts
const {
  getCategories,
  getSubcategories,
  getProducts,
  getProductById,
  getServiceWithProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  toggleBestSeller,
} = useCatalogManager();
```

Jangan akses Supabase langsung dari komponen catalog.

## Aturan Slug

- Slug dibuat otomatis dari nama/title (lowercase, kebab-case, karakter non-ASCII di-strip)
- Gunakan helper `ensureUniqueProductSlug()` saat create/update produk
- Slug kategori dan produk **tidak boleh sama** antar entitas yang berbeda

## Admin Modal Pattern

Komponen modal (`CatalogProductModal.vue`, `CatalogServiceModal.vue`, dll) menggunakan pola:

```ts
const props = defineProps<{ item: Product | null; isOpen: boolean }>();
const emit = defineEmits<{ saved: []; close: [] }>();
// item null = mode create; item ada = mode edit
```

## Tampilan Harga

- Harga produk emas bersifat dinamis — terhubung ke `gold_price_settings` via `useGoldPricing()`
- Tampilkan harga dalam format Rupiah: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`
- Jangan hardcode harga di template

## Gambar Produk

- Produk bisa punya banyak gambar (`images: string[]`) dan satu video opsional (`video_url`)
- Upload via `ImageKitUploader` component; hapus gambar lama via `/api/imagekit/delete-by-url`
- Gunakan `useImageOptimization()` untuk generate URL dengan transformasi ImageKit
