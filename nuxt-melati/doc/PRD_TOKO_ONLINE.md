## Product Requirements Document (PRD): Manajemen Stok & Dashboard Admin

**Tujuan:** Mengembangkan sistem manajemen inventaris yang akurat dan modul pemrosesan pesanan yang efisien untuk melengkapi ekosistem katalog perhiasan yang sudah ada.

> **Catatan Implementasi:** Semua pengembangan harus mengikuti konvensi yang sudah ada di project (lihat `.github/copilot-instructions.md`). Jangan menambahkan dependency baru kecuali benar-benar diperlukan.

---

### 1. Modul Manajemen Stok (Inventory)

Karena produk perhiasan bersifat unik (berdasarkan berat dan kadar), manajemen stok harus mendukung detail spesifik per unit.

- **Pencatatan Stok Real-time:** Pengurangan stok otomatis saat pesanan dibuat; penambahan kembali jika pesanan dibatalkan atau diretur. Gunakan Supabase Realtime subscriptions di sisi dashboard admin — **bukan polling**.
- **Manajemen SKU:** Generate kode unik per item (format: `MGS-{KARAT}-{CATEGORY_CODE}-{YYYYMMDD}-{SEQ}`, contoh: `MGS-24K-CIN-20260408-001`) untuk memudahkan pelacakan.
- **Log Perubahan Stok:** Histori lengkap di tabel `stock_logs` (kapan stok ditambah, dijual, atau disesuaikan). Setiap mutasi stok harus menulis ke log — implementasi via Supabase Database Trigger atau lewat composable `useInventoryManager`.
- **Notifikasi Stok Rendah:** Bandingkan `current_stock` vs `min_stock_threshold` saat halaman dashboard dimuat atau saat Realtime event diterima. Gunakan `useToast()` yang sudah ada untuk menampilkan alert.
- **Multi-Varian:** Stok dikelola per varian di tabel `product_variants` (ukuran cincin, warna). Tabel `catalog_products` tetap sebagai produk induk.

**Tabel Database Baru (ikuti konvensi `snake_case`):**

```sql
-- Varian produk (ukuran, warna, dll.)
product_variants (
  id, product_id FK → catalog_products,
  sku VARCHAR UNIQUE NOT NULL,
  variant_label VARCHAR,     -- "Ukuran 16", "Rose Gold"
  current_stock INT DEFAULT 0,
  min_stock_threshold INT DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at, updated_at
)

-- Log setiap perubahan stok
stock_logs (
  id, variant_id FK → product_variants,
  order_id FK → orders NULLABLE,
  change_type VARCHAR,       -- 'sale' | 'restock' | 'adjustment' | 'return'
  quantity_change INT,       -- positif = tambah, negatif = kurang
  stock_before INT,
  stock_after INT,
  notes TEXT,
  created_by UUID FK → admin_users,
  created_at
)
```

---

### 2. Dashboard Admin (Order Management)

Pusat kendali untuk memantau performa toko dan memproses transaksi harian. Halaman admin menggunakan `layout: 'admin'` yang sudah ada.

- **Ringkasan Performa (Overview):** Widget untuk total penjualan, jumlah pesanan masuk, dan produk terlaris. Data diambil lewat composable `useOrderManager` dengan `useAsyncData`.
- **Daftar Pesanan (Order List):** Tabel dengan filter status menggunakan komponen `AppPagination` yang sudah ada. Filter via query param agar URL shareable.
- **Detail Pesanan:** Halaman `/admin/orders/[id]` — rincian item, alamat pengiriman, total bayar.
- **Input Resi & Logistik:** Input nomor resi manual. Integrasi API ekspedisi (Binderbyte/Raja Ongkir) sebagai fitur fase 2 via Netlify Function di `server/api/shipping/track.get.ts`.
- **Manajemen Status Pembayaran:** Fase 1 = verifikasi manual (admin upload bukti bayar). Fase 2 = integrasi Midtrans/Xendit via Netlify Function `server/api/payment/webhook.post.ts` (karena site static, webhook **harus** diproses di server function, bukan client).
- **Cetak Label & Invoice:** Gunakan library `jspdf` + `jspdf-autotable` di sisi client (tidak perlu server). Buat composable `useInvoicePrinter` di `composables/shared/`.

**Tabel Database Baru:**

```sql
orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR UNIQUE NOT NULL,  -- format: ORD-YYYYMMDD-XXX
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_address TEXT,
  status VARCHAR DEFAULT 'pending',
    -- 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  payment_method VARCHAR,               -- 'transfer' | 'cod' | 'gateway'
  payment_proof_url TEXT,
  shipping_tracking_number VARCHAR,
  shipping_courier VARCHAR,
  total_amount NUMERIC(15,2) NOT NULL,
  notes TEXT,
  created_by UUID FK → admin_users,
  created_at, updated_at
)

order_items (
  id, order_id FK → orders,
  product_id FK → catalog_products,
  variant_id FK → product_variants NULLABLE,
  product_title VARCHAR NOT NULL,       -- snapshot saat order (harga bisa berubah)
  product_sku VARCHAR NOT NULL,
  karat_type VARCHAR,
  weight_grams NUMERIC(8,3),
  unit_price NUMERIC(15,2) NOT NULL,
  quantity INT DEFAULT 1,
  subtotal NUMERIC(15,2) NOT NULL
)
```

---

### 3. Fitur Keamanan & Pengguna

- **RBAC — Perluas Role yang Sudah Ada:** Jangan buat sistem auth baru. Tambahkan nilai baru pada kolom `role` di tabel `admin_users` yang sudah ada:

  | Role                     | Akses                                                                               |
  | ------------------------ | ----------------------------------------------------------------------------------- |
  | `supervisor` (sudah ada) | Full access — semua fitur                                                           |
  | `admin` (sudah ada)      | Katalog, stok, lihat pesanan, proses pesanan & input resi, stok & penerimaan barang |

- **Audit Log:** Tabel `admin_audit_logs` dengan Supabase trigger (bukan manual di composable) agar tidak bisa di-bypass:

  ```sql
  admin_audit_logs (
    id, admin_user_id FK → admin_users,
    action VARCHAR,           -- 'update_stock' | 'change_order_status' | 'update_price'
    target_table VARCHAR,
    target_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR,
    created_at
  )
  ```

- **RLS (Row Level Security):** Aktifkan RLS di semua tabel baru. Role `warehouse` hanya bisa SELECT/UPDATE `product_variants` dan INSERT `stock_logs`. Role `sales` hanya bisa UPDATE `orders`.

---

### 4. Alur Kerja Sistem (User Flow)

**A. Alur Tambah Produk Baru**

1. Admin buka `/admin/catalog` (tab Produk) → klik **"Tambah Produk"**
2. Navigasi ke `/admin/products/new`
3. Isi semua data: Info Dasar, Media, Stok Awal — dalam satu halaman
4. Klik **"Simpan Produk"** → produk + 1 varian default tersimpan, redirect ke `/admin/products/[id]`
5. Kartu produk di grid catalog langsung menampilkan badge stok hijau

**B. Alur Edit Produk (Info, Media, Stok)**

1. Admin buka `/admin/catalog` → klik **"Edit"** di kartu produk
2. Navigasi ke `/admin/products/[id]` — halaman penuh
3. **Seksi Info Dasar:** ubah nama, deskripsi, kategori, kadar, berat, harga → simpan
4. **Seksi Media:** upload/hapus foto dan video → simpan
5. **Seksi Stok & Varian:** restock, koreksi, tambah varian, lihat log stok → simpan

> Semua operasi produk terpusat di satu URL. URL bisa di-bookmark, di-share antar admin.

**C. Alur Monitoring Stok Rendah**

1. Admin buka `/admin/inventory`
2. Tab "Stok Rendah" menampilkan semua varian yang stoknya ≤ threshold
3. Klik **Restock** → isi jumlah → simpan (auto-log ke `stock_logs`)

**D. Alur Pemrosesan Pesanan**

1. **Pelanggan** memilih produk → klik tombol order (WhatsApp/form) → pesanan masuk dengan `status = 'pending'`, field `stock_booked` counter naik.
2. **Admin/Sales** melihat pesanan baru di `/admin/orders` (Supabase Realtime push notif) → verifikasi pembayaran → ubah status ke `'paid'`.
3. **Sistem** (trigger DB) mengurangi `current_stock` secara permanen dan mencatat ke `stock_logs`.
4. **Admin** menyiapkan barang → input nomor resi → status `'shipped'`.
5. **Konfirmasi selesai** manual oleh admin → status `'completed'`.

**Catatan penting:** karena site output `static`, semua proses order dilakukan di sisi **admin dashboard** (authenticated). Pelanggan tidak punya akun — order masuk via form atau WhatsApp redirect.

---

### 5. Stack & Konvensi Implementasi

Semua pengembangan **harus konsisten** dengan yang sudah ada:

| Aspek               | Keputusan                                                      | Alasan                                          |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| State management    | `useState` + composables                                       | Project sudah melarang Pinia/Vuex               |
| Composable baru     | `useOrderManager`, `useInventoryManager`, `useInvoicePrinter`  | Ikuti pola `useCatalogManager`                  |
| UI components       | Tailwind CSS + custom tokens `maroon`/`gold`/`cream`           | Jangan tambah Headless UI / DaisyUI             |
| Route constants     | Tambahkan ke `~/constants/routes.ts`                           | `ROUTES.ADMIN.ORDERS`, `ROUTES.ADMIN.INVENTORY` |
| Halaman admin       | `definePageMeta({ layout: 'admin' })`                          | Konsisten dengan halaman admin lain             |
| Webhook/server ops  | Netlify Function via `server/api/`                             | Static site, tidak bisa handle di client        |
| PDF cetak           | `jspdf` + `jspdf-autotable` (client-side)                      | Tidak butuh server render                       |
| Real-time dashboard | Supabase Realtime `channel.on('postgres_changes')`             | Bukan polling, bukan Pusher                     |
| Tipe baru           | Tambahkan ke `~/types/catalog.ts` atau buat `~/types/order.ts` | Jangan edit `types/supabase.ts` manual          |

**Konstanta baru yang perlu ditambahkan:**

```ts
// constants/supabase.ts — tambahkan
TABLES.ORDERS = "orders";
TABLES.ORDER_ITEMS = "order_items";
TABLES.PRODUCT_VARIANTS = "product_variants";
TABLES.STOCK_LOGS = "stock_logs";
TABLES.AUDIT_LOGS = "admin_audit_logs";

// constants/routes.ts — tambahkan
ROUTES.ADMIN.ORDERS = "/admin/orders";
ROUTES.ADMIN.ORDER_DETAIL = (id: string) => `/admin/orders/${id}`;
ROUTES.ADMIN.INVENTORY = "/admin/inventory";
ROUTES.ADMIN.PRODUCT_NEW = "/admin/products/new";
ROUTES.ADMIN.PRODUCT_EDIT = (id: string) => `/admin/products/${id}`;
```

---

### 6. Single Truth: Halaman Produk Terpadu

#### Prinsip Desain

Mengikuti pola marketplace (Shopee Seller Center, Tokopedia): **satu produk = satu halaman pengelolaan**. Foto, deskripsi, harga, dan stok dikelola di tempat yang sama. Tidak ada modal besar, tidak ada context switching antar halaman.

#### Mengapa Bukan Modal

`CatalogProductModal.vue` sudah mengelola: kategori, nama, deskripsi, kadar, berat, harga auto-kalkulasi, upload foto multi, upload video, custom links, dan flags. Menambahkan seksi stok + varian + log ke dalam modal yang sama akan:

- Membuat modal `max-h-[90vh]` jadi sangat panjang dan tidak nyaman di-scroll
- Tidak punya URL — tidak bisa di-bookmark atau dibuka di tab baru
- Menyulitkan mobile experience di layar kecil
- Meningkatkan kompleksitas state satu komponen memanggil 2 composable sekaligus

#### Arsitektur Halaman Baru

**Halaman:** `pages/admin/products/[id].vue` dan `pages/admin/products/new.vue`

```
/admin/products/[id]
│
├── Breadcrumb: Dashboard › Katalog › [Nama Produk]
│
├── ── SEKSI 1: Info Dasar ──────────────────────────────────
│   Nama produk, Deskripsi
│   Kategori + Subkategori
│   Kadar Emas, Berat (gram)
│   Harga (auto-kalkulasi atau override manual)
│   Flags: Active, Featured, Best Seller
│   Custom Links (Shopee, WhatsApp) — supervisor only
│   [Simpan Info]
│
├── ── SEKSI 2: Media ────────────────────────────────────────
│   Upload foto (multi, max 30) — foto pertama = thumbnail
│   Upload video (opsional, max 50MB)
│   [Simpan Media]
│
└── ── SEKSI 3: Stok & Varian ────────────────────────────────
    Tabel varian: SKU | Label | Stok | Dipesan | Min | Aksi
    Aksi per baris: [Restock] [Koreksi]
    [+ Tambah Varian]
    Accordion riwayat 5 log terakhir per varian
```

#### Aturan Implementasi

| Kondisi                            | Perilaku                                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Tambah produk baru**             | Tombol "Tambah Produk" di `CatalogProductManager` → navigasi ke `/admin/products/new`                                            |
| **Simpan produk baru**             | Jika `initialStock > 0`, `initProductStock()` auto-create 1 `product_variants` default, lalu redirect ke `/admin/products/[id]`  |
| **Edit produk**                    | Tombol "Edit" di kartu produk → navigasi ke `/admin/products/[id]`                                                               |
| **Setiap seksi tersimpan mandiri** | Simpan Info, Simpan Media, dan operasi stok adalah aksi independen — tidak perlu simpan semua sekaligus                          |
| **`CatalogProductModal.vue`**      | Tidak dihapus (backward-safe). Cukup ubah tombol Edit di `CatalogProductManager` agar navigasi ke halaman baru, bukan buka modal |

#### Fungsi Baru di `useInventoryManager`

```ts
// Dipanggil sekali setelah produk baru dibuat, jika initialStock > 0
const initProductStock = async (
  productId: string,
  initialStock: number,
  threshold: number = 2,
): Promise<ApiResponse<ProductVariant>> => { ... }

// Untuk badge stok di kartu produk CatalogProductManager
const getStockSummariesByProducts = async (
  productIds: string[],
): Promise<Record<string, { total: number; lowest: number; variantCount: number }>> => { ... }
// Batch query — satu request untuk semua produk visible, bukan N request
```

#### Perubahan File

| File                                                 | Perubahan                                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `pages/admin/products/new.vue`                       | **Baru** — form tambah produk + stok awal                                                |
| `pages/admin/products/[id].vue`                      | **Baru** — halaman edit terpadu (3 seksi)                                                |
| `components/admin/catalog/CatalogProductManager.vue` | Tombol Edit → `navigateTo(ROUTES.ADMIN.PRODUCT_EDIT(id))`. Tambah stock badge per kartu. |
| `composables/catalog/useInventoryManager.ts`         | Tambah `initProductStock()` + `getStockSummariesByProducts()`                            |
| `constants/routes.ts`                                | Tambah `ROUTES.ADMIN.PRODUCT_NEW` + `ROUTES.ADMIN.PRODUCT_EDIT`                          |
| `CatalogProductModal.vue`                            | Tidak diubah (tetap ada, tidak dipakai untuk edit produk)                                |
| `pages/admin/inventory.vue`                          | Hapus tab "Per Produk" — fungsinya pindah ke halaman produk. Ganti dengan tab "Log Stok" |

#### Peran Baru `/admin/inventory`

| Tab             | Konten                                                                | Perubahan                         |
| --------------- | --------------------------------------------------------------------- | --------------------------------- |
| **Stok Rendah** | Alert semua varian ≤ threshold, tombol Restock                        | Tetap, tidak berubah              |
| **Log Stok**    | Tabel `stock_logs` seluruh produk, filter by produk & tanggal, export | **Baru** — ganti tab "Per Produk" |

#### Stock Badge pada Kartu Produk

Badge stok kecil di pojok kiri bawah thumbnail di `CatalogProductManager`, dengan warna:

- **Hijau** `bg-green-100 text-green-800` → stok > `min_stock_threshold`
- **Kuning** `bg-yellow-100 text-yellow-800` → stok ≤ `min_stock_threshold` dan > 0
- **Merah** `bg-red-100 text-red-800` → stok = 0
- **Abu** `bg-gray-100 text-gray-500` → belum ada varian (produk baru)

Data stok di-batch fetch sekali via `getStockSummariesByProducts(productIds)` saat komponen mount — **bukan** N request per produk.

#### Urutan Implementasi

```
1. Tambah ROUTES.ADMIN.PRODUCT_NEW + ROUTES.ADMIN.PRODUCT_EDIT ke constants/routes.ts
2. Tambah initProductStock() + getStockSummariesByProducts() ke useInventoryManager
3. Buat pages/admin/products/new.vue
4. Buat pages/admin/products/[id].vue (3 seksi: Info, Media, Stok)
5. Update CatalogProductManager: tombol Edit → navigasi, tambah stock badge
6. Refactor /admin/inventory: hapus tab "Per Produk", tambah tab "Log Stok"
```

> **Tidak ada perubahan database** — tabel yang sudah ada cukup untuk mendukung semua ini.
