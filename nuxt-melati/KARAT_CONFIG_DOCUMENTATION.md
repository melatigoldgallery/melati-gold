# Fitur Konfigurasi Kadar Emas - Link Shopee & WhatsApp

## 📋 Overview

Fitur ini memungkinkan pengelolaan link Shopee dan nomor WhatsApp berdasarkan kategori kadar emas dengan sistem hybrid:

- **Konfigurasi Global**: Link default untuk kadar muda (8K-9K) dan kadar tua (16K-24K)
- **Override Per Produk**: Link custom untuk produk spesial (opsional)

## 🗂️ File yang Dibuat/Dimodifikasi

### 1. Database Schema

- **File**: `database/karat_config_schema.sql`
- **Tabel Baru**: `karat_configurations`
- **Kolom Baru di `catalog_products`**:
  - `custom_shopee_link` (TEXT, nullable)
  - `custom_whatsapp_number` (VARCHAR(20), nullable)

### 2. Composables

- **File**: `composables/useKaratConfig.ts`
- **Functions**:
  - `getConfigs()` - Ambil semua konfigurasi
  - `getConfigByKarat(karat)` - Ambil config berdasarkan kadar
  - `updateConfig(id, updates)` - Update konfigurasi
  - `getProductContact(product)` - Dapatkan link & WA untuk produk (dengan fallback)
  - `getWhatsAppLink(number, message)` - Generate link WhatsApp

### 3. Components

- **File**: `components/admin/KaratConfigManager.vue`
  - UI untuk manage konfigurasi kadar di admin panel
- **File**: `components/admin/catalog/CatalogProductModal.vue`
  - Tambahan field untuk custom link Shopee & WhatsApp (opsional)

### 4. Pages

- **File**: `pages/admin/catalog.vue`
  - Tambahan tab "Konfigurasi Kadar"

## 🚀 Cara Menggunakan

### Setup Database (Pertama Kali)

1. Jalankan SQL schema di Supabase:

```bash
# Copy isi file database/karat_config_schema.sql
# Paste dan execute di Supabase SQL Editor
```

2. Tabel akan terisi dengan data default:
   - **Kadar Muda**: 8K, 9K
   - **Kadar Tua**: 16K, 18K, 20K, 21K, 22K, 23K, 24K

### Konfigurasi Admin Panel

1. Buka Admin Panel → **Katalog** → Tab **Konfigurasi Kadar**
2. Edit setiap kategori:
   - **Link Toko Shopee**: URL halaman toko Shopee Anda
   - **Nomor WhatsApp**: Format 6281234567890 (tanpa +, spasi, atau tanda hubung)
   - **Template Pesan**: Gunakan placeholder:
     - `{product_name}` - Nama produk
     - `{karat}` - Kadar emas
     - `{price}` - Harga produk

### Menambah/Edit Produk

**Scenario 1: Produk Normal (90% kasus)**

- Pilih kadar saat input produk
- **Kosongkan** field "Link Custom"
- Sistem otomatis pakai konfigurasi default berdasarkan kadar

**Scenario 2: Produk Spesial (10% kasus)**

- Produk best-seller, promo, atau limited edition
- **Isi** field "Link Shopee Produk Spesifik" dengan URL langsung ke produk
- **Isi** field "Nomor WhatsApp Khusus" jika perlu admin berbeda

## 🔄 Flow Logic

```
User klik "Beli di Shopee" pada produk:

1. Cek apakah produk punya custom_shopee_link?
   ├─ YA → Arahkan ke link custom (produk spesifik)
   └─ TIDAK → Ambil config berdasarkan kadar
      ├─ 8K atau 9K → Link toko Shopee kadar muda
      └─ 16K-24K → Link toko Shopee kadar tua

2. Cek apakah produk punya custom_whatsapp_number?
   ├─ YA → Gunakan nomor custom
   └─ TIDAK → Gunakan nomor dari konfigurasi kadar
```

## 💡 Contoh Penggunaan

### Konfigurasi Default

```javascript
// Kadar Muda (8K-9K)
{
  shopee_store_url: "https://shopee.co.id/melatigold.muda",
  whatsapp_number: "6281234567890",
  template: "Halo Admin Muda, saya tertarik dengan {product_name} kadar {karat}"
}

// Kadar Tua (16K-24K)
{
  shopee_store_url: "https://shopee.co.id/melatigold.tua",
  whatsapp_number: "6289876543210",
  template: "Halo Admin Tua, saya tertarik dengan {product_name} kadar {karat}"
}
```

### Produk dengan Custom Link

```javascript
// Produk: Kalung Premium 18K (best-seller)
{
  title: "Kalung Premium 18K",
  karat: "18K",
  custom_shopee_link: "https://shopee.co.id/Kalung-Premium-18K-i.123.456",
  custom_whatsapp_number: "" // Kosong = pakai default kadar tua
}
```

## 📱 Contoh Output

### Produk Normal (18K tanpa custom link):

- **Klik Shopee**: → `https://shopee.co.id/melatigold.tua`
- **Klik WhatsApp**: → `wa.me/6289876543210?text=Halo Admin Tua, saya tertarik dengan Cincin Emas 18K kadar 18K`

### Produk Custom (18K dengan link spesifik):

- **Klik Shopee**: → `https://shopee.co.id/Kalung-Premium-18K-i.123.456`
- **Klik WhatsApp**: → `wa.me/6289876543210?text=Halo Admin Tua, saya tertarik dengan Kalung Premium 18K kadar 18K`

## 🎯 Keuntungan Sistem Ini

✅ **Efisien**: Tidak perlu input link untuk setiap produk  
✅ **Fleksibel**: Produk spesial bisa punya link sendiri  
✅ **Mudah Maintain**: Update 1 tempat = semua produk terpengaruh  
✅ **Auto-routing**: Customer otomatis ke admin yang tepat berdasarkan kadar  
✅ **Scalable**: Mudah tambah kategori kadar baru jika perlu

## 🔧 Maintenance

### Update Nomor WhatsApp Semua Produk

1. Buka Admin → Katalog → Konfigurasi Kadar
2. Edit nomor di kategori yang sesuai
3. Semua produk tanpa custom number akan otomatis pakai nomor baru

### Tambah Kategori Kadar Baru (jika perlu)

1. Insert manual di tabel `karat_configurations`
2. Atur karat_list, shopee_store_url, dan whatsapp_number
3. Sistem otomatis detect saat produk pakai kadar tersebut

## 📞 Support

Jika ada masalah atau pertanyaan, hubungi developer untuk assistance.
