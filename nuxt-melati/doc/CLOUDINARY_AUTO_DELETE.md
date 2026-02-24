# Cloudinary Auto-Delete: Rencana Implementasi

## Masalah

Saat ini, ketika foto dihapus dari produk atau produk dihapus, file di Cloudinary **tidak ikut terhapus**, sehingga storage menumpuk.

---

## Analisis Codebase

| Komponen          | Lokasi                                                  | Status                      |
| ----------------- | ------------------------------------------------------- | --------------------------- |
| Upload file       | `composables/useCloudinary.ts` → `uploadFile()`         | ✅ Ada                      |
| Delete file       | `composables/useCloudinary.ts` → `deleteFile(publicId)` | ✅ Ada                      |
| Server delete API | `server/api/cloudinary/delete.post.ts`                  | ✅ Ada                      |
| Delete produk DB  | `composables/useCatalogManager.ts` → `deleteProduct()`  | ⚠️ Tidak trigger Cloudinary |
| Update produk DB  | `composables/useCatalogManager.ts` → `updateProduct()`  | ⚠️ Tidak trigger Cloudinary |

**Root cause:** `public_id` Cloudinary tidak disimpan di database — hanya URL yang disimpan. Perlu ekstrak `public_id` dari URL sebelum delete.

### Format URL Cloudinary

```
https://res.cloudinary.com/{cloudName}/image/upload/melati-gold/{folder}/{filename}.{ext}
```

Public ID yang disimpan Cloudinary = `melati-gold/{folder}/{filename}` (tanpa ekstensi).

---

## Rencana Implementasi

### Step 1 — Tambah helper `extractPublicId` di `useCloudinary.ts`

```typescript
const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  // Hapus ekstensi dan ambil path setelah '/upload/'
  // Handle URL dengan transformasi: .../upload/t_xxx/melati-gold/...
  const match = url.match(/\/upload\/(?:[^/]+\/)*?(melati-gold\/.+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
};
```

Ekspor di return object:

```typescript
return { ..., extractPublicId };
```

---

### Step 2 — Tambah server endpoint batch delete (opsional, efisiensi)

**File:** `server/api/cloudinary/delete-batch.post.ts`

```typescript
// Terima array publicIds, delete semua sekaligus
// Body: { publicIds: string[] }
// Panggil cloudinary.uploader.destroy() untuk tiap ID
```

Atau cukup loop `deleteFile()` satu-satu dari composable (simpler, cukup untuk skala ini).

---

### Step 3 — Modifikasi `deleteProduct` di `useCatalogManager.ts`

**Logika:**

1. Fetch data produk dulu (`thumbnail_image`, `images[]`, `video_url`)
2. Kumpulkan semua URL → ekstrak `public_id`
3. Hapus semua dari Cloudinary (best-effort, non-blocking)
4. Hapus dari database

```typescript
const deleteProduct = async (id: string) => {
  try {
    // 1. Ambil data produk
    const { data: product } = await $supabase
      .from("catalog_products")
      .select("thumbnail_image, images, video_url")
      .eq("id", id)
      .single();

    // 2. Hapus dari DB
    const { error } = await $supabase.from("catalog_products").delete().eq("id", id);
    if (error) throw error;

    // 3. Hapus aset Cloudinary (best-effort, jangan block kalau gagal)
    if (product) {
      const { deleteFile, extractPublicId } = useCloudinary();
      const urls = [
        product.thumbnail_image,
        ...(product.images || []),
        product.video_url,
      ].filter(Boolean);

      const uniqueUrls = [...new Set(urls)]; // Deduplicate
      for (const url of uniqueUrls) {
        const publicId = extractPublicId(url);
        if (publicId) await deleteFile(publicId).catch(console.warn);
      }
    }

    // Invalidate cache...
    return { success: true };
  } catch (error) { ... }
};
```

> **Catatan:** Delete Cloudinary dilakukan **setelah** delete DB berhasil. Kalau Cloudinary gagal, produk tetap terhapus dari DB (tidak rollback) — acceptable karena file orphan bisa dibersihkan manual.

---

### Step 4 — Deteksi gambar yang dihapus saat update produk

Modifikasi `CatalogProductModal.vue` pada fungsi `save()`, atau buat helper di `useCatalogManager.ts`.

**Logika di `updateProduct`:** Terima parameter tambahan `oldImageUrls`:

```typescript
const updateProduct = async (id: string, productData: any, oldImageUrls?: string[]) => {
  // ... update DB seperti sekarang ...

  // Setelah DB update berhasil, hapus gambar yang dihapus dari Cloudinary
  if (oldImageUrls && oldImageUrls.length > 0) {
    const newUrls = new Set([...(productData.images || []), productData.video_url].filter(Boolean));

    const { deleteFile, extractPublicId } = useCloudinary();
    for (const url of oldImageUrls) {
      if (!newUrls.has(url)) {
        const publicId = extractPublicId(url);
        if (publicId) await deleteFile(publicId).catch(console.warn);
      }
    }
  }
};
```

**Di `CatalogProductModal.vue`**, sebelum memanggil `updateProduct`, simpan URL lama:

```typescript
// Di onMounted, setelah load product:
const originalMediaUrls = ref<string[]>([]);

// Saat init product:
originalMediaUrls.value = [...(props.product.images || []), props.product.video_url].filter(Boolean);

// Di fungsi save():
await updateProduct(props.product.id, form.value, originalMediaUrls.value);
```

---

## Urutan Implementasi

```
1. useCloudinary.ts          → Tambah extractPublicId()
2. useCatalogManager.ts      → Modifikasi deleteProduct()
3. useCatalogManager.ts      → Modifikasi updateProduct() (terima oldImageUrls)
4. CatalogProductModal.vue   → Simpan originalMediaUrls, kirim ke updateProduct()
```

---

## Edge Cases

| Kasus                                  | Handling                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| URL bukan dari Cloudinary              | `extractPublicId` return `null`, skip                                                 |
| Cloudinary gagal saat delete           | `catch(console.warn)` — non-fatal                                                     |
| Thumbnail = item pertama di `images[]` | Deduplicate URL sebelum delete                                                        |
| Video URL berbeda resource_type        | Server endpoint sudah handle image, perlu tambah `resource_type: "video"` untuk video |

### ⚠️ Video: resource_type berbeda

`cloudinary.uploader.destroy(publicId)` default ke `resource_type: "image"`. Untuk video:

```typescript
// Di delete.post.ts — terima resource_type opsional
const { publicId, resourceType = "image" } = await readBody(event);
await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
```

Dan di `extractPublicId` / `deleteFile`, deteksi video dari URL path (`/video/upload/`).

---

## File yang Perlu Diubah

1. `composables/useCloudinary.ts`
2. `composables/useCatalogManager.ts`
3. `components/admin/catalog/CatalogProductModal.vue`
4. `server/api/cloudinary/delete.post.ts` (tambah `resource_type` support)
5. _(Opsional)_ `server/api/cloudinary/delete-batch.post.ts` (baru)
