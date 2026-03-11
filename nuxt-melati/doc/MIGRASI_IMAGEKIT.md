# Panduan Migrasi: Cloudinary → ImageKit

> **Proyek:** Melati Gold Gallery (Nuxt 3 + Supabase)
> **Tanggal:** 2026-03-11
> **Branch:** `migrasi`

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur Saat Ini (Cloudinary)](#2-arsitektur-saat-ini-cloudinary)
3. [Arsitektur Target (ImageKit)](#3-arsitektur-target-imagekit)
4. [Perbandingan Cloudinary vs ImageKit](#4-perbandingan-cloudinary-vs-imagekit)
5. [Pemetaan File yang Terdampak](#5-pemetaan-file-yang-terdampak)
6. [Rencana Migrasi Step-by-Step](#6-rencana-migrasi-step-by-step)
7. [Detail Perubahan per File](#7-detail-perubahan-per-file)
8. [Migrasi Aset Existing](#8-migrasi-aset-existing)
9. [Strategi Rollback](#9-strategi-rollback)
10. [Checklist Final](#10-checklist-final)

---

## 1. Ringkasan Eksekutif

Proyek Melati Gold saat ini menggunakan **Cloudinary** sebagai media storage dan CDN untuk gambar produk dan video. Migrasi ke **ImageKit** bertujuan untuk:

- **Unlimited transformasi** - Cloudinary mengenakan kredit per transformasi, ImageKit tidak
- **Bandwidth lebih besar** di free tier (20 GB vs 25 GB di ImageKit)
- **Real-time image optimization** tanpa biaya tambahan
- **URL-based transformation** yang lebih sederhana
- **Dashboard dan analytics** yang lebih intuitif

### Cakupan Migrasi

| Aspek | Jumlah |
|-------|--------|
| Composables yang berubah | 2 file |
| Components yang berubah | 9 file |
| Server API routes | 2 file (delete, usage) |
| Config files | 2 file (nuxt.config.ts, .env) |
| Total file terdampak | **15 file** |

---

## 2. Arsitektur Saat Ini (Cloudinary)

### Flow Upload
```
Browser → Cloudinary Upload API (unsigned preset) → Cloudinary CDN
                                                        ↓
                                                   URL disimpan ke Supabase DB
```

### Flow Display
```
Supabase DB → URL Cloudinary (original)
                  ↓
              useImageOptimization.ts → inject transformation string ke URL
                  ↓
              Browser request → Cloudinary CDN (transform on-the-fly / eager cache)
```

### Flow Delete
```
Browser → /api/cloudinary/delete (server route) → Cloudinary Admin API (signed)
```

### File & Tanggung Jawab

| File | Fungsi |
|------|--------|
| `composables/useCloudinary.ts` | Upload (client-side unsigned), delete (via server), URL extraction, transformasi, usage |
| `composables/useImageOptimization.ts` | Preset transformasi (thumbnail, card, cardCatalog, gallery, detail, hero, icon), srcset generator |
| `components/CloudinaryUploader.vue` | Drag-and-drop uploader, preview, viewer modal |
| `server/api/cloudinary/delete.post.ts` | Server-side delete via Cloudinary SDK (signed) |
| `server/api/cloudinary/usage.get.ts` | Server-side usage query via Cloudinary SDK |
| `composables/useCatalogManager.ts` | CRUD produk — auto-delete media saat update/delete produk |
| `nuxt.config.ts` | Runtime config: cloudName, apiKey, uploadPreset, apiSecret |

### Komponen yang Mengonsumsi Media

| Component | Jenis Optimasi |
|-----------|---------------|
| `FeaturedProducts.vue` | `presets.card` (w_400,h_533) |
| `CatalogShowcase.vue` | `presets.card` (w_400,h_533) |
| `CustomServices.vue` | `presets.card` (w_400,h_533) |
| `catalog/ProductGrid.vue` | `presets.cardCatalog` (w_400,h_500) |
| `product/ProductGallery.vue` | `presets.gallery` (w_800,h_1067), `presets.thumbnail`, srcset |
| `product/RelatedProducts.vue` | `presets.card`, `presets.cardCatalog` (responsive) |
| `admin/catalog/CatalogProductModal.vue` | CloudinaryUploader untuk images (max 30) dan video (max 50MB) |
| `admin/catalog/CatalogCategoryModal.vue` | CloudinaryUploader untuk cover image |
| `admin/catalog/CatalogServiceModal.vue` | CloudinaryUploader untuk service image |

### Pola URL Cloudinary Saat Ini
```
Original:
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/melati-gold/{folder}/{public_id}.{ext}

Dengan transformasi:
https://res.cloudinary.com/{cloud_name}/image/upload/w_400,h_533,c_fill,g_auto,f_auto,q_auto/v{version}/melati-gold/{folder}/{public_id}.{ext}

Video:
https://res.cloudinary.com/{cloud_name}/video/upload/v{version}/melati-gold/{folder}/{public_id}.{ext}
```

---

## 3. Arsitektur Target (ImageKit)

### Flow Upload (Baru)
```
Browser → Server Route /api/imagekit/auth (get auth params)
       → ImageKit Upload API (signed/client-side) → ImageKit CDN
                                                        ↓
                                                   URL disimpan ke Supabase DB
```

### Flow Display (Baru)
```
Supabase DB → URL ImageKit (original)
                  ↓
              useImageOptimization.ts → inject transformation via URL params
                  ↓
              Browser request → ImageKit CDN (transform on-the-fly, gratis)
```

### Flow Delete (Baru)
```
Browser → /api/imagekit/delete (server route) → ImageKit Server API (private key)
```

### Pola URL ImageKit
```
Original:
https://ik.imagekit.io/{imagekit_id}/melati-gold/{folder}/{filename}

Dengan transformasi (URL params):
https://ik.imagekit.io/{imagekit_id}/melati-gold/{folder}/{filename}?tr=w-400,h-533,fo-auto,f-auto,q-auto

Atau (path-based):
https://ik.imagekit.io/{imagekit_id}/tr:w-400,h-533,fo-auto,f-auto,q-auto/melati-gold/{folder}/{filename}
```

---

## 4. Perbandingan Cloudinary vs ImageKit

| Fitur | Cloudinary (Free) | ImageKit (Free) |
|-------|-------------------|-----------------|
| Storage | 25 GB | 20 GB |
| Bandwidth | 25 GB/bulan | 20 GB/bulan |
| Transformasi | 25 kredit/bulan (terbatas) | **Unlimited** |
| Video processing | Terbatas kredit | Terbatas di free |
| URL Delivery | `res.cloudinary.com` | `ik.imagekit.io` |
| Real-time transform | Ya (pakai kredit) | **Ya (gratis)** |
| Auto format (WebP/AVIF) | `f_auto` | `f-auto` |
| Auto quality | `q_auto` | `q-auto` |
| Face detection | `g_face` | `fo-face` |
| Smart crop | `c_fill,g_auto` | `c-maintain_ratio,fo-auto` |
| Upload method | Unsigned preset | Client-side auth (signature) |
| SDK | `cloudinary` npm | `imagekitio-vue` / `imagekit-javascript` |

### Mapping Transformasi Cloudinary → ImageKit

| Cloudinary | ImageKit | Keterangan |
|------------|----------|------------|
| `w_400` | `w-400` | Width |
| `h_533` | `h-533` | Height |
| `c_fill` | `c-maintain_ratio` atau `cm-extract` | Crop mode |
| `g_auto` | `fo-auto` | Focus / gravity |
| `f_auto` | `f-auto` | Format otomatis |
| `q_auto` | `q-auto` | Quality otomatis |
| `c_fit` | `c-at_max` | Fit mode |
| `c_scale` | `c-force` | Scale mode |
| `g_face` | `fo-face` | Face detection |

---

## 5. Pemetaan File yang Terdampak

### Kategori A: Core — Harus Diubah Total

| # | File | Aksi |
|---|------|------|
| 1 | `composables/useCloudinary.ts` | **Rename → `useImageKit.ts`**, rewrite upload/delete/transform logic |
| 2 | `composables/useImageOptimization.ts` | Rewrite transformasi URL dari Cloudinary format ke ImageKit format |
| 3 | `components/CloudinaryUploader.vue` | **Rename → `ImageKitUploader.vue`**, rewrite upload logic |
| 4 | `server/api/cloudinary/delete.post.ts` | **Pindah → `server/api/imagekit/delete.post.ts`**, gunakan ImageKit SDK |
| 5 | `server/api/cloudinary/usage.get.ts` | **Pindah → `server/api/imagekit/usage.get.ts`**, gunakan ImageKit SDK |

### Kategori B: Config — Update Credentials

| # | File | Aksi |
|---|------|------|
| 6 | `nuxt.config.ts` | Ganti runtimeConfig dari Cloudinary → ImageKit keys |
| 7 | `.env` / `.env.example` | Ganti env vars: `IMAGEKIT_*` |
| 8 | `package.json` | Hapus `cloudinary`, tambah `imagekit` |

### Kategori C: Konsumen Media — Update Import & URL Check

| # | File | Perubahan |
|---|------|-----------|
| 9 | `components/FeaturedProducts.vue` | Ganti check `cloudinary.com` → `ik.imagekit.io` |
| 10 | `components/CatalogShowcase.vue` | Ganti check `cloudinary.com` → `ik.imagekit.io` |
| 11 | `components/CustomServices.vue` | Ganti check `cloudinary.com` → `ik.imagekit.io` |
| 12 | `components/catalog/ProductGrid.vue` | Ganti check `cloudinary.com` → `ik.imagekit.io` |
| 13 | `components/product/ProductGallery.vue` | Ganti check `cloudinary.com` → `ik.imagekit.io` |
| 14 | `components/product/RelatedProducts.vue` | Ganti check `cloudinary.com` → `ik.imagekit.io` |
| 15 | `admin/catalog/CatalogProductModal.vue` | Ganti `CloudinaryUploader` → `ImageKitUploader` |
| 16 | `admin/catalog/CatalogCategoryModal.vue` | Ganti `CloudinaryUploader` → `ImageKitUploader` |
| 17 | `admin/catalog/CatalogServiceModal.vue` | Ganti `CloudinaryUploader` → `ImageKitUploader` |

### Kategori D: Indirect — Auto-delete Logic

| # | File | Perubahan |
|---|------|-----------|
| 18 | `composables/useCatalogManager.ts` | Ganti `useCloudinary()` → `useImageKit()`, update `deleteFileByUrl` |

---

## 6. Rencana Migrasi Step-by-Step

### Fase 1: Setup ImageKit Account & Konfigurasi

**1.1. Buat akun ImageKit**
- Daftar di https://imagekit.io
- Catat: `URL Endpoint`, `Public Key`, `Private Key`

**1.2. Buat folder structure**
- Buat folder `melati-gold/` di dashboard ImageKit
- Sub-folder: `products/`, `categories/`, `services/`, `general/`

**1.3. Update environment variables**

```env
# .env — HAPUS INI:
# NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
# NUXT_PUBLIC_CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...

# .env — TAMBAH INI:
NUXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
NUXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
```

**1.4. Update nuxt.config.ts**

```ts
runtimeConfig: {
  // Server-only (private)
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,

  public: {
    // Client-side (public)
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
    imagekitUrlEndpoint: process.env.NUXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
    imagekitPublicKey: process.env.NUXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  },
},
```

**1.5. Update package.json**

```bash
npm uninstall cloudinary
npm install imagekit-javascript   # Client-side upload
npm install imagekit              # Server-side SDK (delete, usage, auth)
```

---

### Fase 2: Buat Server API Routes (ImageKit)

**2.1. Buat `server/api/imagekit/auth.get.ts`** (BARU — wajib untuk client-side upload)

ImageKit client-side upload membutuhkan signature dari server (berbeda dari Cloudinary yang pakai unsigned preset).

```ts
// server/api/imagekit/auth.get.ts
import ImageKit from 'imagekit';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const imagekit = new ImageKit({
    publicKey: config.public.imagekitPublicKey,
    privateKey: config.imagekitPrivateKey,
    urlEndpoint: config.public.imagekitUrlEndpoint,
  });

  const authParams = imagekit.getAuthenticationParameters();
  return authParams; // { token, expire, signature }
});
```

**2.2. Buat `server/api/imagekit/delete.post.ts`**

```ts
// server/api/imagekit/delete.post.ts
import ImageKit from 'imagekit';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { fileId } = await readBody(event);

  if (!fileId) {
    throw createError({ statusCode: 400, statusMessage: 'File ID is required' });
  }

  const imagekit = new ImageKit({
    publicKey: config.public.imagekitPublicKey,
    privateKey: config.imagekitPrivateKey,
    urlEndpoint: config.public.imagekitUrlEndpoint,
  });

  const result = await imagekit.deleteFile(fileId);
  return { success: true, result };
});
```

**2.3. Buat `server/api/imagekit/usage.get.ts`** (opsional — untuk dashboard admin)

> Catatan: ImageKit free tier tidak memiliki usage API yang setara dengan Cloudinary.
> Alternatif: gunakan dashboard ImageKit secara manual, atau buat endpoint
> sederhana yang mengembalikan informasi dari ImageKit media library API.

---

### Fase 3: Rewrite Core Composables

**3.1. Buat `composables/useImageKit.ts`** (menggantikan `useCloudinary.ts`)

```ts
// composables/useImageKit.ts
export const useImageKit = () => {
  const config = useRuntimeConfig();
  const uploading = ref(false);

  // Upload single file (client-side dengan server auth)
  const uploadFile = async (file: File, folder = 'general') => {
    uploading.value = true;
    try {
      const urlEndpoint = config.public.imagekitUrlEndpoint;
      const publicKey = config.public.imagekitPublicKey;

      if (!urlEndpoint || !publicKey) {
        throw new Error('ImageKit not configured');
      }

      // 1. Dapatkan auth params dari server
      const authParams = await $fetch('/api/imagekit/auth');

      // 2. Upload ke ImageKit
      const formData = new FormData();
      formData.append('file', file);
      formData.append('publicKey', publicKey);
      formData.append('signature', authParams.signature);
      formData.append('expire', String(authParams.expire));
      formData.append('token', authParams.token);
      formData.append('fileName', `${folder}_${Date.now()}_${file.name}`);
      formData.append('folder', `/melati-gold/${folder}`);

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      return {
        success: true,
        data: {
          url: result.url,
          fileId: result.fileId,       // Penting untuk delete
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          format: result.fileType,
          bytes: result.size,
        },
      };
    } catch (error: any) {
      console.error('ImageKit upload error:', error);
      return { success: false, error: error.message || 'Upload failed' };
    } finally {
      uploading.value = false;
    }
  };

  // Extract fileId dari URL (untuk delete)
  // ImageKit URL: https://ik.imagekit.io/{id}/melati-gold/...
  // Catatan: fileId tidak bisa di-extract dari URL, perlu disimpan di DB.
  // Alternatif: gunakan ImageKit list API dengan path search.
  const extractFileInfo = (url: string) => {
    if (!url || !url.includes('ik.imagekit.io')) return null;
    // Extract path setelah endpoint
    const endpoint = config.public.imagekitUrlEndpoint;
    const path = url.replace(endpoint, '').split('?')[0];
    return { path, isImageKit: true };
  };

  // Delete file dari ImageKit by fileId
  const deleteFile = async (fileId: string) => {
    try {
      const response = await $fetch('/api/imagekit/delete', {
        method: 'POST',
        body: { fileId },
      });
      return { success: true, data: response };
    } catch (error: any) {
      console.error('ImageKit delete error:', error);
      return { success: false, error: error.message || 'Delete failed' };
    }
  };

  // Delete file by URL (perlu search API karena ImageKit butuh fileId)
  const deleteFileByUrl = async (url: string) => {
    try {
      const response = await $fetch('/api/imagekit/delete-by-url', {
        method: 'POST',
        body: { url },
      });
      return { success: true, data: response };
    } catch (error: any) {
      console.error('ImageKit delete by URL error:', error);
      return { success: false, error: error.message || 'Delete failed' };
    }
  };

  // Transform image URL dengan ImageKit transformations
  const transformImage = (url: string, transformations: string) => {
    if (!url || !url.includes('ik.imagekit.io')) return url;
    // Gunakan query parameter approach
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tr=${transformations}`;
  };

  // Common transformations
  const getOptimizedUrl = (
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number | string;
      format?: string;
    } = {},
  ) => {
    const transforms: string[] = [];

    if (options.width) transforms.push(`w-${options.width}`);
    if (options.height) transforms.push(`h-${options.height}`);
    if (options.quality) transforms.push(`q-${options.quality}`);
    if (options.format) transforms.push(`f-${options.format}`);

    // Auto format dan quality jika tidak ditentukan
    if (!options.format) transforms.push('f-auto');
    if (!options.quality) transforms.push('q-auto');

    return transformImage(url, transforms.join(','));
  };

  return {
    uploading: readonly(uploading),
    uploadFile,
    deleteFile,
    deleteFileByUrl,
    extractFileInfo,
    transformImage,
    getOptimizedUrl,
  };
};
```

**3.2. Rewrite `composables/useImageOptimization.ts`**

```ts
// composables/useImageOptimization.ts — ImageKit version

interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'maintain_ratio' | 'force' | 'at_max' | 'at_least';
  focus?: 'auto' | 'face' | 'center';
}

export const useImageOptimization = () => {
  const getOptimizedUrl = (originalUrl: string, options: ImageKitTransformOptions = {}): string => {
    if (!originalUrl || !originalUrl.includes('ik.imagekit.io')) {
      return originalUrl;
    }

    const {
      width, height,
      quality = 'auto',
      format = 'auto',
      crop = 'maintain_ratio',
      focus = 'auto',
    } = options;

    const transforms: string[] = [];
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (crop) transforms.push(`c-${crop}`);
    if (focus) transforms.push(`fo-${focus}`);
    transforms.push(`f-${format}`);
    transforms.push(`q-${quality}`);

    const transformString = transforms.join(',');
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}tr=${transformString}`;
  };

  const presets = {
    thumbnail: (url: string) =>
      getOptimizedUrl(url, { width: 400, height: 533, crop: 'maintain_ratio', focus: 'auto' }),

    card: (url: string) =>
      getOptimizedUrl(url, { width: 400, height: 533, crop: 'maintain_ratio', focus: 'auto' }),

    cardCatalog: (url: string) =>
      getOptimizedUrl(url, { width: 400, height: 500, crop: 'maintain_ratio', focus: 'auto' }),

    gallery: (url: string) =>
      getOptimizedUrl(url, { width: 800, height: 1067, crop: 'maintain_ratio', focus: 'auto' }),

    detail: (url: string) =>
      getOptimizedUrl(url, { width: 800, height: 1067, crop: 'maintain_ratio', focus: 'auto' }),

    hero: (url: string) =>
      getOptimizedUrl(url, { width: 800, height: 1067, crop: 'maintain_ratio', focus: 'auto' }),

    icon: (url: string) =>
      getOptimizedUrl(url, { width: 400, height: 533, crop: 'maintain_ratio', focus: 'auto' }),
  };

  const generateSrcSet = (url: string, sizes: number[] = [400, 800]): string => {
    const RATIO_MAP: Record<number, number> = { 400: 533, 800: 1067 };
    return sizes
      .filter((s) => s in RATIO_MAP)
      .map((w) => {
        const h = RATIO_MAP[w];
        const optimized = getOptimizedUrl(url, { width: w, height: h, crop: 'maintain_ratio', focus: 'auto' });
        return `${optimized} ${w}w`;
      })
      .join(', ');
  };

  return { getOptimizedUrl, presets, generateSrcSet };
};
```

---

### Fase 4: Update Components

**4.1. Rename dan rewrite `CloudinaryUploader.vue` → `ImageKitUploader.vue`**

Perubahan utama:
- Import `useImageKit` instead of `useCloudinary`
- Upload logic menggunakan ImageKit auth + upload endpoint
- Inline optimization check: `ik.imagekit.io` instead of `cloudinary.com`
- Sisanya (UI, preview, drag-drop) tetap sama

**4.2. Update semua komponen konsumen**

Untuk setiap file di Kategori C, perubahan bersifat search-and-replace:

```
CARI:    cloudinary.com
GANTI:   ik.imagekit.io

CARI:    CloudinaryUploader
GANTI:   ImageKitUploader

CARI:    useCloudinary
GANTI:   useImageKit
```

File yang perlu diubah:
- `FeaturedProducts.vue` — ganti `cloudinary.com` check
- `CatalogShowcase.vue` — ganti `cloudinary.com` check
- `CustomServices.vue` — ganti `cloudinary.com` check
- `catalog/ProductGrid.vue` — ganti `cloudinary.com` check
- `product/ProductGallery.vue` — ganti `cloudinary.com` check
- `product/RelatedProducts.vue` — ganti `cloudinary.com` check
- `admin/catalog/CatalogProductModal.vue` — ganti component name
- `admin/catalog/CatalogCategoryModal.vue` — ganti component name
- `admin/catalog/CatalogServiceModal.vue` — ganti component name

---

### Fase 5: Update Catalog Manager (Auto-Delete Logic)

File `composables/useCatalogManager.ts` line 6:

```ts
// SEBELUM:
const { deleteFileByUrl } = useCloudinary();

// SESUDAH:
const { deleteFileByUrl } = useImageKit();
```

**Perhatian khusus:** Cloudinary menggunakan `publicId` untuk delete yang bisa di-extract dari URL. ImageKit menggunakan `fileId` yang **tidak ada di URL**. Ada dua pendekatan:

**Opsi A (Rekomendasi): Simpan fileId di database**
- Tambah kolom `media_file_ids` (jsonb) di tabel `catalog_products`
- Saat upload, simpan mapping `{ url: fileId }` ke kolom ini
- Saat delete, ambil fileId dari kolom ini

**Opsi B: Search by filePath via ImageKit API**
- Buat server route `server/api/imagekit/delete-by-url.post.ts`
- Extract path dari URL, lalu gunakan `imagekit.listFiles({ searchQuery: 'name="filename"' })`
- Dapat fileId, lalu delete
- Lebih lambat, tapi tidak perlu ubah schema DB

```ts
// server/api/imagekit/delete-by-url.post.ts — Opsi B
import ImageKit from 'imagekit';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { url } = await readBody(event);

  const imagekit = new ImageKit({
    publicKey: config.public.imagekitPublicKey,
    privateKey: config.imagekitPrivateKey,
    urlEndpoint: config.public.imagekitUrlEndpoint,
  });

  // Extract filename dari URL
  const urlPath = new URL(url).pathname;
  const fileName = urlPath.split('/').pop();

  if (!fileName) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' });
  }

  // Search file di ImageKit
  const files = await imagekit.listFiles({
    searchQuery: `name="${fileName}"`,
    limit: 1,
  });

  if (!files || files.length === 0) {
    return { success: false, message: 'File not found in ImageKit' };
  }

  // Delete by fileId
  await imagekit.deleteFile(files[0].fileId);
  return { success: true, message: `Deleted ${fileName}` };
});
```

---

### Fase 6: Migrasi Data Existing

Lihat [Bagian 8](#8-migrasi-aset-existing) untuk detail lengkap.

---

## 7. Detail Perubahan per File

### 7.1. `nuxt.config.ts`

```diff
 runtimeConfig: {
-  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
+  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,

   public: {
     supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
     supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
-    cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
-    cloudinaryApiKey: process.env.NUXT_PUBLIC_CLOUDINARY_API_KEY || '',
-    cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'melati_gold_unsigned',
+    imagekitUrlEndpoint: process.env.NUXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
+    imagekitPublicKey: process.env.NUXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
   },
 },
```

### 7.2. `.env.example`

```diff
 # Supabase Configuration
 NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
 NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

-# Cloudinary Configuration
-NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
-NUXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key_here
-CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
-NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=melati_gold_unsigned
+# ImageKit Configuration
+NUXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
+NUXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key_here
+IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key_here
```

### 7.3. `package.json`

```diff
 "dependencies": {
-  "cloudinary": "^2.7.0",
+  "imagekit": "^5.0.0",
+  "imagekit-javascript": "^3.0.0",
 }
```

### 7.4. File Baru yang Perlu Dibuat

| File | Fungsi |
|------|--------|
| `server/api/imagekit/auth.get.ts` | Auth endpoint untuk client-side upload |
| `server/api/imagekit/delete.post.ts` | Delete file by fileId |
| `server/api/imagekit/delete-by-url.post.ts` | Delete file by URL (search + delete) |
| `composables/useImageKit.ts` | Core composable (ganti useCloudinary) |

### 7.5. File yang Dihapus

| File | Alasan |
|------|--------|
| `server/api/cloudinary/delete.post.ts` | Diganti ImageKit endpoint |
| `server/api/cloudinary/usage.get.ts` | Diganti ImageKit endpoint |
| `composables/useCloudinary.ts` | Diganti `useImageKit.ts` |
| `components/CloudinaryUploader.vue` | Diganti `ImageKitUploader.vue` |

---

## 8. Migrasi Aset Existing

### Masalah Utama

Semua URL gambar/video yang tersimpan di Supabase database mengarah ke domain `res.cloudinary.com`. Setelah migrasi, aset baru akan di-upload ke `ik.imagekit.io`. Perlu strategi untuk menangani aset lama.

### Opsi Migrasi Aset

#### Opsi A: Migrasi Penuh (Rekomendasi)

1. **Download** semua aset dari Cloudinary
2. **Upload** ke ImageKit
3. **Update** semua URL di Supabase database
4. **Benefit:** Clean state, semua URL konsisten

```bash
# Script migrasi (pseudocode)
1. Query semua URL Cloudinary dari Supabase
   - catalog_products: thumbnail_image, images[], video_url
   - catalog_categories: cover_image
   - custom_services: image

2. Untuk setiap URL:
   a. Download file dari Cloudinary
   b. Upload ke ImageKit dengan folder path yang sama
   c. Simpan mapping: { old_url: new_url, fileId: ... }

3. Update Supabase:
   a. Untuk setiap record, replace old URLs dengan new URLs
   b. (Opsional) Simpan fileId ke kolom baru

4. Verifikasi semua URL baru bisa diakses
5. Hapus aset Cloudinary setelah verifikasi selesai
```

SQL migration yang dibutuhkan (jika pakai Opsi A dari Fase 5):
```sql
-- Tambah kolom untuk menyimpan ImageKit fileIds
ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS media_file_ids jsonb DEFAULT '{}';

-- Contoh isi: { "https://ik.imagekit.io/.../img1.jpg": "fileId123", ... }
```

#### Opsi B: Dual Support (Transisi Bertahap)

Ubah function `isImageKitUrl` di composables untuk mendukung kedua domain:

```ts
const isMediaUrl = (url: string): boolean => {
  return url.includes('ik.imagekit.io') || url.includes('cloudinary.com');
};
```

Aset lama tetap di-serve dari Cloudinary, aset baru dari ImageKit. Transformasi hanya berlaku untuk URL ImageKit.

**Kelebihan:** Tidak perlu downtime, migrasi bertahap
**Kekurangan:** Maintain dua service, Cloudinary tetap aktif, transformasi lama tidak di-optimize

#### Opsi C: ImageKit External Storage (URL Proxy)

ImageKit mendukung **external storage** yang bisa mem-proxy Cloudinary URLs melalui ImageKit CDN:

1. Di dashboard ImageKit → Settings → External Storage
2. Tambahkan Cloudinary sebagai origin: `https://res.cloudinary.com`
3. Akses via: `https://ik.imagekit.io/{id}/cloudinary-proxy/...`

**Kelebihan:** Zero downtime, semua gambar langsung lewat ImageKit CDN
**Kekurangan:** Masih bergantung pada Cloudinary sebagai origin

---

## 9. Strategi Rollback

### Jika migrasi gagal atau ada masalah

1. **Code rollback:** `git checkout main` — kembali ke branch utama
2. **Aset Cloudinary:** JANGAN hapus aset Cloudinary sampai migrasi 100% terverifikasi
3. **Database:** Backup Supabase sebelum update URLs
4. **DNS/CDN:** Tidak ada perubahan DNS, rollback instant

### Checklist sebelum menghapus Cloudinary

- [ ] Semua halaman publik menampilkan gambar dengan benar
- [ ] Admin bisa upload gambar/video baru
- [ ] Admin bisa delete gambar/video
- [ ] Auto-delete saat update/hapus produk berfungsi
- [ ] Performance (LCP, loading time) sama atau lebih baik
- [ ] Tidak ada broken images di production selama 7 hari

---

## 10. Checklist Final

### Pre-Migrasi
- [ ] Buat akun ImageKit dan catat credentials
- [ ] Backup database Supabase
- [ ] Pastikan branch `migrasi` up-to-date dengan `main`
- [ ] Verifikasi semua aset Cloudinary bisa di-download

### Implementasi
- [ ] Update `.env` dan `.env.example`
- [ ] Update `nuxt.config.ts`
- [ ] Update `package.json` (uninstall cloudinary, install imagekit)
- [ ] Buat `server/api/imagekit/auth.get.ts`
- [ ] Buat `server/api/imagekit/delete.post.ts`
- [ ] Buat `server/api/imagekit/delete-by-url.post.ts`
- [ ] Buat `composables/useImageKit.ts`
- [ ] Rewrite `composables/useImageOptimization.ts`
- [ ] Rename dan rewrite `CloudinaryUploader.vue` → `ImageKitUploader.vue`
- [ ] Update `useCatalogManager.ts`
- [ ] Update semua komponen konsumen (9 file)
- [ ] Hapus file Cloudinary lama (4 file)
- [ ] Jalankan migrasi aset (download dari Cloudinary, upload ke ImageKit)
- [ ] Update URLs di Supabase database

### Post-Migrasi
- [ ] Test upload gambar baru (produk, kategori, service)
- [ ] Test upload video baru
- [ ] Test delete gambar/video
- [ ] Test auto-delete saat update produk (hapus gambar dari gallery)
- [ ] Test auto-delete saat hapus produk
- [ ] Verifikasi semua halaman publik menampilkan gambar
- [ ] Verifikasi transformasi bekerja (thumbnail, card, gallery, dll)
- [ ] Check browser DevTools: tidak ada 404 untuk gambar
- [ ] Performance test: compare LCP sebelum dan sesudah
- [ ] Deploy ke staging/preview di Netlify
- [ ] Monitor 48 jam sebelum delete aset Cloudinary

### Urutan Eksekusi yang Disarankan

```
1. Setup ImageKit account & credentials
2. Install dependencies
3. Buat server API routes (auth, delete)
4. Buat useImageKit composable
5. Rewrite useImageOptimization
6. Buat ImageKitUploader component
7. Update semua komponen konsumen
8. Update useCatalogManager
9. Test lokal: upload, display, delete
10. Migrasi aset existing
11. Update URLs di database
12. Deploy ke staging
13. Full regression test
14. Deploy ke production
15. Monitor & cleanup Cloudinary
```

---

## Catatan Penting

### ImageKit Upload berbeda dari Cloudinary

| Aspek | Cloudinary | ImageKit |
|-------|-----------|----------|
| Client upload | Unsigned preset (no server needed) | **Wajib auth dari server** (signature) |
| Delete | Bisa via publicId dari URL | **Perlu fileId** (tidak ada di URL) |
| Folder structure | `folder` param saat upload | `folder` param saat upload |
| Auto-format | `f_auto` | `f-auto` |
| Eager transform | Ya (pre-generate saat upload) | Tidak perlu (transform gratis) |

### Keuntungan setelah migrasi

1. **Tidak perlu eager transform** — Cloudinary mengenakan kredit untuk setiap transformasi unik. Dengan ImageKit, semua transformasi on-the-fly dan gratis. Ini berarti kode eager transform di `useImageOptimization.ts` bisa disederhanakan.

2. **Tidak perlu khawatir transform credits** — Sistem srcset dan preset bisa lebih fleksibel tanpa takut kehabisan kredit.

3. **URL transformasi lebih bersih** — Menggunakan query parameter (`?tr=w-400,h-533`) alih-alih path injection (`/upload/w_400,h_533/`).
