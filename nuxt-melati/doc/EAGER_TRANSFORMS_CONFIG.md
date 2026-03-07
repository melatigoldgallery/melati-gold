# Cloudinary Eager Transforms Configuration

> **Optimasi Mobile-First untuk Free Tier (60% traffic mobile)**  
> Total: 3 eager transforms — minimal namun optimal

---

## 📋 Eager Transforms yang Harus Dikonfigurasi

Login ke **Cloudinary Dashboard** → **Settings** → **Upload** → **Upload presets** → pilih preset Anda (biasanya `ml_default` atau nama custom) → scroll ke **Eager transformations**

Hapus semua eager lama (jika ada), lalu **tambahkan 3 transformasi ini**:

```
w_320,h_400,c_fill,f_auto,q_auto,g_auto
w_400,h_533,c_fill,f_auto,q_auto,g_auto
w_800,h_1067,c_fill,f_auto,q_auto,g_auto
```

### Format Input di Cloudinary UI:

Jika ada field terpisah untuk setiap transform:

| #   | Transformation String                      | Keterangan           |
| --- | ------------------------------------------ | -------------------- |
| 1   | `w_320,h_400,c_fill,f_auto,q_auto,g_auto`  | Mobile card (4:5)    |
| 2   | `w_400,h_533,c_fill,f_auto,q_auto,g_auto`  | Card umum (3:4)      |
| 3   | `w_800,h_1067,c_fill,f_auto,q_auto,g_auto` | Gallery/detail (3:4) |

---

## 🎯 Penggunaan di Kode

| Preset Kode   | Eager Mapping | Use Case                             | Display Size |
| ------------- | ------------- | ------------------------------------ | ------------ |
| `thumbnail`   | 320×400       | Thumbnail kecil, mobile list preview | 80–200px     |
| `cardCatalog` | 320×400       | Mobile catalog grid, carousel mobile | 160–320px    |
| `card`        | 400×533       | Desktop card grid, featured products | 250–400px    |
| `gallery`     | 800×1067      | Gallery main slide                   | 400–800px    |
| `detail`      | 800×1067      | Lightbox fullscreen                  | 500–1000px   |
| `icon`        | 400×533       | Admin preview icon                   | varies       |

---

## 💡 Keunggulan Setup Ini

✅ **Mobile-First:** 60% traffic mobile dapat file ~40% lebih kecil (320w vs 400w)  
✅ **Free Tier Aman:** Hanya 3 eager, semua request = CDN cache hit  
✅ **Zero Transform Credits:** Tidak ada on-demand transform, kredit hanya untuk upload  
✅ **Bandwidth Hemat:** `f_auto` → WebP/AVIF otomatis, `q_auto` → kualitas optimal per gambar  
✅ **Aspect Ratio Fleksibel:** 4:5 untuk mobile portrait, 3:4 untuk desktop/gallery

---

## 🔄 Regenerate Eager untuk Gambar Lama

**Gambar yang sudah ada sebelum eager diubah tidak otomatis regenerate.**

### Opsi 1: Re-upload (Paling Mudah)

Di admin panel, hapus gambar lama → upload ulang. Eager baru akan otomatis dibuat.

### Opsi 2: Manual Regenerate via Cloudinary Admin Dashboard

1. Buka Cloudinary Media Library
2. Pilih gambar → klik **Transform** atau **Manage**
3. Apply ulang eager transforms (jika ada opsi)

### Opsi 3: API Explicit (Batch)

Untuk regenerate banyak gambar sekaligus, gunakan Cloudinary Admin API endpoint `explicit`:

```bash
curl -X POST "https://api.cloudinary.com/v1_1/{cloud_name}/image/explicit" \
  -d "public_id=melati-gold/categories/sample_image" \
  -d "type=upload" \
  -d "eager=w_320,h_400,c_fill,f_auto,q_auto,g_auto|w_400,h_533,c_fill,f_auto,q_auto,g_auto|w_800,h_1067,c_fill,f_auto,q_auto,g_auto" \
  -d "timestamp={unix_timestamp}" \
  -d "api_key={your_api_key}" \
  -d "signature={computed_signature}"
```

**Prioritas regenerate:**  
Hero images, kategori cover, featured products → gunakan API batch.  
Produk biasa → biarkan sampai di-upload ulang secara natural.

---

## 📊 Estimasi Penghematan Bandwidth

| Skenario                         | Ukuran File | Traffic/hari | Bandwidth/hari |
| -------------------------------- | ----------- | ------------ | -------------- |
| **Sebelum** (tanpa eager mobile) | ~60 KB      | 60% × 1000   | ~36 MB         |
| **Sesudah** (eager 320w mobile)  | ~25 KB      | 60% × 1000   | ~15 MB         |
| **Penghematan**                  |             |              | **~58%**       |

Dengan free tier 25 GB/bulan → bisa handle **~1.600 pengunjung/hari** (vs ~950 sebelumnya).

---

## ✅ Checklist Implementasi

- [ ] Update eager transforms di Cloudinary Upload Preset (3 varian)
- [ ] Kode sudah diselaraskan (otomatis via commit ini)
- [ ] Test upload gambar baru → pastikan 3 eager ter-generate
- [ ] Monitor Cloudinary usage: bandwidth & transformations
- [ ] (Opsional) Regenerate gambar penting via API explicit

---

**Last Updated:** March 7, 2026  
**Status:** ✅ Production Ready
