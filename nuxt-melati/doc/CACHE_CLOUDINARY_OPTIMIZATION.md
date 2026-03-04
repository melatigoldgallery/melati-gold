# Cache & Cloudinary Optimization Plan

> Rujukan perbaikan untuk menghemat Cloudinary Free Tier (25 credits/bulan)
> Diperbarui: Maret 2026

---

## 0. Temuan Kunci: Eager Transforms & Aspect Ratio

### Eager Transforms Lama (Square — Tidak Optimal)

Upload preset Cloudinary saat ini menggunakan dimensi **square** yang tidak cocok dengan tampilan UI:

| Eager Lama             | Digunakan saat ini? | Masalah                                  |
| ---------------------- | ------------------- | ---------------------------------------- |
| `w_200,h_200,c_fill`   | ❌ Tidak            | Square crop, UI pakai 3:4 portrait       |
| `w_400,h_400,c_fill`   | ❌ Tidak            | Square crop, UI pakai 3:4 portrait       |
| `w_800,h_800,c_fill`   | ❌ Tidak            | Square crop, file lebih besar dari perlu |
| `w_1000,h_1000,c_fill` | ❌ Tidak            | Square crop, file lebih besar dari perlu |

**Masalah double:** (1) dimensi tidak cocok kode → miss CDN cache → transform kredit habis, (2) square crop menghasilkan file lebih besar dari yang dibutuhkan untuk tampilan portrait.

---

### Audit Aspect Ratio Komponen

| Komponen                        | Aspect Ratio CSS | Preset Dipakai      |
| ------------------------------- | ---------------- | ------------------- |
| `CatalogShowcase.vue`           | `aspect-[3/4]`   | `presets.card`      |
| `CustomServices.vue`            | `aspect-[3/4]`   | `presets.card`      |
| `FeaturedProducts.vue`          | `aspect-[3/4]`   | `presets.card`      |
| `ProductGallery.vue` (main)     | `aspect-[3/4]`   | `presets.gallery`   |
| `ProductGallery.vue` (thumb)    | small strip      | `presets.thumbnail` |
| `RelatedProducts.vue` (desktop) | `aspect-[3/4]`   | `presets.card`      |
| `RelatedProducts.vue` (mobile)  | `aspect-[4/5]`   | `presets.card`      |
| `catalog/ProductGrid.vue`       | `aspect-[4/5]`   | `presets.card`      |
| Lightbox                        | full screen      | `presets.detail`    |

**Kesimpulan:** 2 rasio dominan → **3:4 portrait** (mayoritas) dan **4:5 portrait** (catalog grid + mobile).

### ✅ Eager Transforms Baru yang Direkomendasikan

Ganti 4 eager square dengan **3 eager portrait** berikut di Cloudinary Upload Preset:

| #   | Eager Params Baru                          | Rasio | Use Case                                                              | Display Size |
| --- | ------------------------------------------ | ----- | --------------------------------------------------------------------- | ------------ |
| 1   | `w_400,h_533,c_fill,f_auto,q_auto,g_auto`  | 3:4   | Card grid (Showcase, Featured, Services, Related) + Thumbnail (alias) | 80–400px     |
| 2   | `w_400,h_500,c_fill,f_auto,q_auto,g_auto`  | 4:5   | ProductGrid (catalog page) + mobile Related                           | 250–400px    |
| 3   | `w_800,h_1067,c_fill,f_auto,q_auto,g_auto` | 3:4   | Gallery main slide + Lightbox (alias)                                 | 350–1000px   |

**Keuntungan vs eager square lama:**

- File size lebih kecil (portrait crop = pixel lebih sedikit) — hemat bandwidth
- Tidak ada whitespace/crop aneh di UI yang pakai `aspect-[3/4]`
- Preset kode cocok persis dengan eager → **setiap request = CDN hit, 0 transform kredit**

**Apa artinya Eager?**
Transformasi ini di-_generate_ pada saat gambar di-upload, bukan on-demand. Setelah pertama kali di-request, Cloudinary CDN men-cache hasilnya dan melayani langsung dari CDN tanpa menghitung transform kredit ulang.

---

### Masalah Saat Ini: Preset Kode vs Eager

```
presets.card      → w_300, h_400         ← BUKAN eager → kredit habis setiap request
presets.thumbnail → w_150, h_200         ← BUKAN eager → kredit habis setiap request
presets.gallery   → w_450, h_600         ← BUKAN eager → kredit habis setiap request
presets.detail    → w_600, h_800         ← BUKAN eager → kredit habis setiap request
presets.hero      → w_1200, h_600        ← BUKAN eager → kredit habis setiap request
generateSrcSet    → w_200 (no h, no crop) ← BUKAN eager → kredit habis setiap request
```

**= Setiap gambar yang ditampilkan = transform kredit baru = FREE TIER CEPAT HABIS.**

---

## 1. Status Cache Data (Supabase)

### ✅ Sudah Baik

| Data                    | Implementasi                             | TTL Saat Ini |
| ----------------------- | ---------------------------------------- | ------------ |
| Kategori                | `fetchWithCache` + memory + localStorage | 60 menit     |
| Subkategori             | `fetchWithCache` + memory + localStorage | 60 menit     |
| Produk (list)           | `fetchWithCache` + memory + localStorage | 30 menit     |
| Custom Services         | `fetchWithCache` + memory + localStorage | 60 menit     |
| Gold pricing            | `fetchWithCache` + memory + localStorage | 60 menit     |
| In-flight deduplication | ✅ Map per key                           | —            |
| LRU eviction            | ✅ Max 100 entries                       | —            |

### ❌ Gap Kritis

| Item                    | Masalah                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `getProductById`        | **Tidak ada cache** — setiap buka halaman produk = 1 fetch Supabase + semua transform gambar baru |
| TTL Kategori & Services | 60 menit terlalu pendek untuk data yang jarang berubah — seharusnya **24 jam**                    |
| Cloudinary presets      | Seluruh preset tidak sesuai eager dimensions → **0 hits CDN cache**                               |

---

## 2. Rencana Perbaikan (Prioritas)

---

### 🔴 PRIORITAS 1A — Update Eager Transforms di Cloudinary Dashboard

**Aksi di Cloudinary:** Settings → Upload → Upload presets → edit preset → Eager transformations

**Hapus** 4 eager square lama, **ganti** dengan 3 eager portrait baru:

```
w_400,h_533,c_fill,f_auto,q_auto,g_auto
w_400,h_500,c_fill,f_auto,q_auto,g_auto
w_800,h_1067,c_fill,f_auto,q_auto,g_auto
```

> **Catatan:** Gambar yang sudah ada sebelumnya **tidak otomatis di-regenerate** saat upload preset diubah.
>
> **Cara regenerate eager untuk gambar lama (pilih salah satu):**
>
> **Opsi A — Re-upload (paling mudah):**
> Di app admin, hapus gambar lama lalu upload ulang gambar yang sama. Upload baru akan menggunakan preset baru secara otomatis.
>
> **Opsi B — Cloudinary Admin API (tanpa re-upload):**
> Gunakan endpoint `explicit` via cURL atau Postman:
>
> ```
> POST https://api.cloudinary.com/v1_1/{cloud_name}/image/explicit
> Body (form-data):
>   public_id = your_image_public_id
>   type       = upload
>   eager      = w_400,h_533,c_fill,f_auto,q_auto,g_auto|w_400,h_500,c_fill,f_auto,q_auto,g_auto|w_800,h_1067,c_fill,f_auto,q_auto,g_auto
>   api_key    = {your_api_key}
>   timestamp  = {unix_timestamp}
>   signature  = {generated_signature}
> ```
>
> Dokumentasi: https://cloudinary.com/documentation/image_upload_api_reference#explicit
>
> **Prioritas regenerate:** gambar kategori cover + custom services + produk unggulan (hero section). Gambar produk biasa bisa dibiarkan sampai di-upload ulang secara natural.

---

### 🔴 PRIORITAS 1B — Selaraskan Presets Kode ke Eager Baru

**File:** `composables/useImageOptimization.ts`

```typescript
const presets = {
  // 3:4 portrait card — CatalogShowcase, FeaturedProducts, CustomServices, RelatedProducts (desktop)
  // Eager: w_400,h_533,c_fill,f_auto,q_auto,g_auto
  card: (url: string) =>
    getOptimizedUrl(url, { width: 400, height: 533, quality: "auto", format: "auto", crop: "fill", gravity: "auto" }),

  // 4:5 portrait card — catalog/ProductGrid.vue, RelatedProducts (mobile)
  // Eager: w_400,h_500,c_fill,f_auto,q_auto,g_auto
  cardCatalog: (url: string) =>
    getOptimizedUrl(url, { width: 400, height: 500, quality: "auto", format: "auto", crop: "fill", gravity: "auto" }),

  // 3:4 thumbnail — ProductGallery strip (~80-160px tampil)
  // Eager: w_200,h_267,c_fill,f_auto,q_auto,g_auto
  thumbnail: (url: string) =>
    getOptimizedUrl(url, { width: 200, height: 267, quality: "auto", format: "auto", crop: "fill", gravity: "auto" }),

  // 3:4 gallery main — ProductGallery main slide (~400-500px tampil)
  // Eager: w_800,h_1067,c_fill,f_auto,q_auto,g_auto
  gallery: (url: string) =>
    getOptimizedUrl(url, { width: 800, height: 1067, quality: "auto", format: "auto", crop: "fill", gravity: "auto" }),

  // 3:4 lightbox / detail penuh
  // Eager: w_1000,h_1333,c_fill,f_auto,q_auto,g_auto
  detail: (url: string) =>
    getOptimizedUrl(url, { width: 1000, height: 1333, quality: "auto", format: "auto", crop: "fill", gravity: "auto" }),

  // Hero — gambar hero adalah file lokal (/img/bg.png), bukan Cloudinary → tidak perlu preset
  // Icon/logo kecil (admin preview)
  // Paling dekat dengan w_200,h_267 — close enough
  icon: (url: string) =>
    getOptimizedUrl(url, { width: 200, height: 267, quality: "auto", format: "auto", crop: "fill", gravity: "auto" }),
};
```

**Perbaiki juga `generateSrcSet` agar hanya pakai eager sizes yang ada, dengan `h` dan `crop` yang cocok persis:**

```typescript
// Mapping eager sizes: width → height (berdasarkan aspect ratio yang ada di eager)
const EAGER_MAP: Record<number, { h: number; crop: "fill" }> = {
  200: { h: 267, crop: "fill" }, // 3:4
  400: { h: 533, crop: "fill" }, // 3:4  ← default card
  800: { h: 1067, crop: "fill" }, // 3:4
  1000: { h: 1333, crop: "fill" }, // 3:4
};

const generateSrcSet = (url: string, sizes: number[] = [400, 800, 1000]): string => {
  const validSizes = sizes.filter((s) => s in EAGER_MAP);
  return validSizes
    .map((w) => {
      const { h, crop } = EAGER_MAP[w];
      const optimizedUrl = getOptimizedUrl(url, {
        width: w,
        height: h, // ← harus sama persis dengan eager
        quality: "auto",
        format: "auto",
        crop: crop, // ← harus sama persis dengan eager
        gravity: "auto", // ← harus sama persis dengan eager
      });
      return `${optimizedUrl} ${w}w`;
    })
    .join(", ");
};
```

**Dampak Langsung:**

- Setiap gambar yang pernah di-upload → **selalu CDN hit**, 0 transform kredit baru
- Crop portrait → file lebih kecil dibanding square lama, hemat bandwidth
- Browser `srcset` memilih size yang benar ada di CDN cache

---

### 🔴 PRIORITAS 2 — Cache `getProductById` (30 menit)

**File:** `composables/useCatalogManager.ts`

`getProductById` saat ini tidak di-cache. Setiap buka halaman `/product/:id` = 1 fetch Supabase baru + semua gambar produk kembali di-request.

```typescript
const getProductById = async (id: string, retryAttempt: number = 0) => {
  // ← TAMBAH BLOCK CACHE DI SINI (sebelum timeout logic):
  const cacheKey = cache.generateKey("catalog_product", { id });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // ... (kode retry & fetch existing tidak berubah) ...

  // ← TAMBAH: simpan ke cache sebelum return success:
  const result = { success: true, data: flattenedData };
  cache.set(cacheKey, result, { ttl: 30 * 60 * 1000 }); // 30 menit
  return result;
};

// ← TAMBAH: invalidasi di updateProduct dan deleteProduct:
cache.clearPrefix("catalog_product");
```

---

### 🔴 PRIORITAS 3 — Perpanjang TTL untuk Data Statis (Kategori & Services)

Kategori dan Custom Services **jarang berubah** (hanya admin yang bisa edit). TTL 60 menit = Supabase fetch baru tiap jam. Dengan TTL lebih panjang, browser yang membuka halaman berkali-kali tidak perlu re-fetch.

**File:** `composables/useCatalogManager.ts`

```typescript
// getCategories — sudah statis, jarang diganti admin
{
  ttl: 24 * 60 * 60 * 1000;
} // ← dari 60 menit → 24 JAM

// getSubcategories — sama seperti kategori
{
  ttl: 24 * 60 * 60 * 1000;
} // ← dari 60 menit → 24 JAM

// getCustomServices — konten promosi, jarang berubah
{
  ttl: 24 * 60 * 60 * 1000;
} // ← dari 60 menit → 24 JAM

// getProducts (list) — bisa berubah harga, tetap moderat
{
  ttl: 30 * 60 * 1000;
} // ← tetap 30 menit (benar)
```

**Catatan:** Cache akan otomatis di-invalidasi saat admin melakukan update/create/delete (kode `clearPrefix` sudah ada di mutation functions).

---

### 🟡 PRIORITAS 4 — Update Penggunaan Preset di Komponen

Setelah preset diubah, komponen berikut perlu menyesuaikan pemanggilan:

**`catalog/ProductGrid.vue`** — ganti ke `cardCatalog` (4:5):

```typescript
// Sebelum:
return presets.card(url);
// Sesudah:
return presets.cardCatalog(url);
```

**`RelatedProducts.vue` (mobile carousel)** — ganti ke `cardCatalog` (4:5):

```typescript
// Mobile RelatedProducts pakai aspect-[4/5], gunakan cardCatalog
return presets.cardCatalog(url);
```

**Hapus `:srcset` dan `sizes` dari komponen card** — satu eager = satu URL = satu request:

```html
<!-- SEBELUM (2-3 request berbeda per gambar) -->
<img
  :src="getOptimizedImage(p.thumbnail_image)"
  :srcset="getSrcSet(p.thumbnail_image)"
  sizes="(max-width: 640px) 50vw, 25vw"
/>

<!-- SESUDAH (1 request = CDN hit dari eager) -->
<img :src="getOptimizedImage(p.thumbnail_image)" loading="lazy" decoding="async" />
```

Komponen yang perlu hapus `:srcset`: `FeaturedProducts.vue`, `CatalogShowcase.vue`, `CustomServices.vue`, `RelatedProducts.vue`

---

### 🟡 PRIORITAS 5 — HTTP Cache-Control Headers (Netlify)

Untuk asset statis lokal di `/public/img/` (logo, bg hero), tambahkan header agar browser men-cache 30 hari.

**File:** `netlify.toml`

```toml
# Cache asset lokal (logo, gambar bg hero) — 30 hari
[[headers]]
  for = "/img/*"
  [headers.values]
    Cache-Control = "public, max-age=2592000, immutable"

# Cache JS/CSS hasil build — 1 tahun (hash sudah berubah jika konten berubah)
[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# HTML SPA entry point — jangan cache lama
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

> **Catatan:** Gambar Cloudinary (`res.cloudinary.com`) dilayani dari CDN Cloudinary langsung, bukan Netlify. Cloudinary secara default sudah set `Cache-Control: max-age=2592000` (30 hari) untuk transformed images. **Tapi ini hanya berlaku jika URL-nya konsisten** — itulah mengapa Prioritas 1 (selaraskan preset ke eager) sangat penting.

---

### 🟡 PRIORITAS 6 — `fetchpriority` untuk LCP Image di Hero

**File:** `HeroSection.vue`

```html
<div v-for="(slide, index) in heroSlides" :key="slide.id" ...>
  <img
    :src="slide.image"
    :fetchpriority="index === 0 ? 'high' : 'low'"
    :loading="index === 0 ? 'eager' : 'lazy'"
    :alt="`Hero Background ${index + 1}`"
    class="..."
  />
</div>
```

---

### 🟢 PRIORITAS 7 — Hapus Duplikasi Logic Transform

`useCloudinary.ts` memiliki `getOptimizedUrl` sendiri (berbeda implementasi) dari `useImageOptimization.ts`.

```typescript
// Di useCloudinary.ts — hapus getOptimizedUrl internal, reuse dari useImageOptimization
const { getOptimizedUrl } = useImageOptimization();
// Hapus local transformImage() dan getOptimizedUrl() functions
```

---

## 3. Bagaimana Cache 30 Hari untuk Gambar Statis (CatalogShowcase & CustomServices)

**Gambar kategori dan services bersifat statis** — hanya berubah jika admin upload ulang.

Mekanisme cache 30 hari terjadi di **dua layer**:

### Layer 1: Cloudinary CDN Cache (Otomatis, berlaku jika URL konsisten)

Cloudinary CDN secara default set header:

```
Cache-Control: public, max-age=2592000   ← 30 hari
```

Ini berlaku **hanya jika URL gambar sama persis** setiap request. Setelah Prioritas 1 diterapkan, preset akan selalu menghasilkan URL deterministik (misal: `.../upload/w_400,h_400,c_fill,f_auto,q_auto,g_auto/foto.jpg`). Browser mengingat URL ini selama 30 hari → **0 bandwidth Cloudinary untuk repeat visitor**.

### Layer 2: App Data Cache (localStorage)

Setelah Prioritas 3 diterapkan, data kategori dan services di-cache **24 jam** di localStorage. Artinya:

- Browser tidak re-fetch data dari Supabase selama 24 jam
- URL gambar tidak berubah (sudah statis) → CDN cache selalu hit
- Efek gabungan: **pengunjung yang balik dalam 24 jam = 0 fetch Supabase + 0 bandwidth Cloudinary**

### Diagram Alur (setelah perbaikan)

```
Kunjungan ke-1:
  → Supabase (fetch data) → localStorage cache 24 jam
  → Cloudinary CDN (transform eager sudah ada) → browser cache 30 hari

Kunjungan ke-2 (dalam 24 jam):
  → localStorage HIT → skip Supabase ✅
  → Browser cache HIT → skip Cloudinary ✅ (0 bandwidth, 0 transform)

Kunjungan ke-3 (setelah 24 jam, dalam 30 hari):
  → localStorage MISS → Supabase fetch (URL gambar sama)
  → Browser cache HIT → skip Cloudinary ✅ (0 bandwidth, 0 transform)
```

---

## 4. Estimasi Penghematan

### Transform Credits

| Komponen                            | Sebelum                           | Sesudah                                 |
| ----------------------------------- | --------------------------------- | --------------------------------------- |
| FeaturedProducts (5 produk)         | 15 transforms/visit               | **0** (CDN hit setelah kunjungan ke-1)  |
| CatalogShowcase (8 kategori)        | 24 transforms/visit               | **0** (CDN hit + browser cache 30 hari) |
| CustomServices (6 services)         | 18 transforms/visit               | **0** (CDN hit + browser cache 30 hari) |
| ProductGallery (5 foto)             | 40 transforms/visit               | **0** (CDN hit setelah kunjungan ke-1)  |
| ProductById (no cache)              | N supabase calls/hari             | **max 1 per 30 menit per visitor**      |
| **Total transforms baru per bulan** | **100+/session × banyak visitor** | **Hanya saat gambar baru diupload**     |

### Bandwidth per Gambar (Portrait vs Square)

| Transform   | Square Lama (px)      | Portrait Baru (px)    | Penghematan                                     |
| ----------- | --------------------- | --------------------- | ----------------------------------------------- |
| Size kecil  | 200×200 = 40.000      | 200×267 = 53.400      | sedikit lebih besar (tapi sesuai UI)            |
| Size medium | 400×400 = 160.000     | 400×533 = 213.200     | sedikit lebih besar (tapi **tidak waste crop**) |
| Size besar  | 800×800 = 640.000     | 800×1067 = 853.600    | sedikit lebih besar                             |
| Size full   | 1000×1000 = 1.000.000 | 1000×1333 = 1.333.000 | sedikit lebih besar                             |

> **Catatan penting:** Meski pixel portrait sedikit lebih banyak dari square, **square crop lama memotong isi gambar yang tidak dipakai** (UI tetap show 3:4). Dengan portrait:
>
> - Tidak ada pixel terbuang dari area yang di-hide CSS
> - Tidak ada mismatch antara crop dan tampilan → tidak ada layout shift
> - File size aktual sangat tergantung konten (Cloudinary `q_auto` adaptif)

---

## 5. Checklist Implementasi

### Wajib Dikerjakan Segera

**Cloudinary Dashboard:**

- [ ] Hapus 4 eager square lama dari Upload Preset
- [ ] Tambah 3 eager portrait baru: `w_400,h_533` / `w_400,h_500` / `w_800,h_1067` (semua dengan `c_fill,f_auto,q_auto,g_auto`)
- [ ] Re-upload atau regenerate eager untuk gambar kategori & service yang sudah ada

**`composables/useImageOptimization.ts`:**

- [x] Ubah `presets.card` → `w_400, h_533` (3:4)
- [x] Tambah `presets.cardCatalog` → `w_400, h_500` (4:5)
- [x] `presets.thumbnail` → alias `card` (w_400,h_533) — browser scale down
- [x] Ubah `presets.gallery` → `w_800, h_1067` (3:4)
- [x] `presets.detail` → alias `gallery` (w_800,h_1067) — cukup untuk lightbox
- [x] Perbaiki `generateSrcSet` dengan `EAGER_MAP` + filter hanya eager sizes

**`composables/useCatalogManager.ts`:**

- [x] Tambah cache di `getProductById` (TTL 30 menit)
- [x] Naikkan TTL `getCategories` → 24 jam
- [x] Naikkan TTL `getSubcategories` → 24 jam
- [x] Naikkan TTL `getCustomServices` → 24 jam

**Komponen:**

- [x] `catalog/ProductGrid.vue` — ganti ke `presets.cardCatalog`
- [x] `RelatedProducts.vue` (mobile) — ganti ke `presets.cardCatalog`
- [x] Hapus `:srcset` + `sizes` dari `FeaturedProducts.vue`
- [x] Hapus `:srcset` + `sizes` dari `CatalogShowcase.vue`
- [x] Hapus `:srcset` + `sizes` dari `CustomServices.vue`
- [x] Hapus `:srcset` + `sizes` dari `RelatedProducts.vue`

**`netlify.toml`:**

- [x] Tambah `Cache-Control: public, max-age=2592000, immutable` untuk `/img/*`
- [x] Tambah `Cache-Control: public, max-age=31536000, immutable` untuk `/_nuxt/*`

### Nice to Have

- [ ] **`HeroSection.vue`** — Tambah `fetchpriority="high"` + `loading="eager"` untuk slide pertama
- [ ] **`useCloudinary.ts`** — Hapus duplikasi `getOptimizedUrl`, reuse dari `useImageOptimization`

---

## Referensi

- [Cloudinary Eager Transformations](https://cloudinary.com/documentation/upload_parameters#eager)
- [Cloudinary CDN Cache Behavior](https://cloudinary.com/documentation/advanced_url_delivery_options#cache_control_headers)
- [Cloudinary Free Tier Limits](https://cloudinary.com/pricing)
- [Netlify Cache Headers](https://docs.netlify.com/routing/headers/)
- File terkait: `composables/useCacheManager.ts`, `composables/useImageOptimization.ts`, `composables/useCatalogManager.ts`
