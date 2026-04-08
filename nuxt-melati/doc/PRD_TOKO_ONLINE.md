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

1. **Pelanggan** memilih produk di katalog → klik tombol order (WhatsApp/form) → `order_items.status = 'pending'`, stok varian berubah jadi "Booked" (`stock_booked` counter).
2. **Admin/Sales** melihat pesanan baru di Dashboard (Supabase Realtime push notif) → verifikasi pembayaran → ubah status ke `'paid'`.
3. **Sistem** (trigger DB) mengurangi `current_stock` secara permanen dan mencatat ke `stock_logs`.
4. **Admin Gudang** menyiapkan barang → Admin Sales menginput nomor resi → status `'shipped'`.
5. **Konfirmasi selesai** manual oleh admin atau otomatis setelah N hari → status `'completed'`.

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
```
