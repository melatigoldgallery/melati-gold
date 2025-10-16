# 📚 KATALOG PRODUK - DOKUMENTASI LENGKAP

## ✅ Fitur yang Telah Dibuat

Sistem katalog produk dengan 3 level navigasi:

1. **Kategori Utama** (6 kategori)
2. **Sub-kategori** (Modal dengan pilihan sub-kategori)
3. **Grid Produk** (Lookbook grid dengan produk)
4. **Detail Produk** (Modal detail dengan carousel gambar)

---

## 📦 Struktur File

### 1. Components

- **CatalogShowcase.vue** - Section katalog dengan 6 kategori utama
- **SubcategoryModal.vue** - Modal pilihan sub-kategori
- **LookbookGrid.vue** - Grid display produk
- **ProductDetailModal.vue** - Modal detail produk dengan carousel

### 2. Composables

- **useCatalogData.ts** - Data management untuk semua produk katalog

### 3. Pages

- **index.vue** - Main page dengan state management untuk semua modal

---

## 🗂️ Struktur Kategori dan Sub-kategori

### 1. **Kalung** (3 sub-kategori)

- ✅ Anak (2 produk)
- ✅ Fashion (2 produk)
- ✅ Pria (1 produk)

### 2. **Liontin** (2 sub-kategori)

- ✅ Anak (1 produk)
- ✅ Fashion (1 produk)

### 3. **Anting** (2 sub-kategori)

- ✅ Anak (1 produk)
- ✅ Fashion (2 produk)

### 4. **Cincin** (3 sub-kategori)

- ✅ Anak (1 produk)
- ✅ Fashion (2 produk)
- ✅ Pria (1 produk)

### 5. **Gelang** (4 sub-kategori)

- ✅ Anak (1 produk)
- ✅ Fashion (1 produk)
- ✅ Bangle (2 produk)
- ✅ Pria (1 produk)

### 6. **Giwang** (2 sub-kategori)

- ✅ Anak (1 produk)
- ✅ Fashion (2 produk)

**Total:** 6 kategori, 16 sub-kategori, 22 produk

---

## 🔄 Flow Pengguna

```
1. User klik card kategori (misal: "Kalung")
   ↓
2. Modal SubcategoryModal muncul dengan pilihan:
   - Kalung Anak
   - Kalung Fashion
   - Kalung Pria
   ↓
3. User pilih sub-kategori (misal: "Kalung Fashion")
   ↓
4. Modal LookbookGrid muncul dengan grid produk
   ↓
5. User klik produk
   ↓
6. Modal ProductDetailModal muncul dengan:
   - Carousel gambar produk
   - Detail (nama, harga, deskripsi, spesifikasi)
   - Tombol WhatsApp
```

---

## 💻 Cara Kerja Kode

### 1. CatalogShowcase.vue

```vue
<!-- Setiap card mengirim event 'open-subcategories' dengan nama kategori -->
<button @click="emit('open-subcategories', category.title)">
  Lihat Katalog
</button>
```

### 2. SubcategoryModal.vue

```vue
<!-- Mapping sub-kategori untuk setiap kategori -->
const subcategoriesMap = {
  Kalung: [
    { key: "anak", title: "Kalung Anak", image: "..." },
    { key: "fashion", title: "Kalung Fashion", image: "..." },
    // ...
  ],
  // ... kategori lainnya
}

<!-- Emit event 'select' saat user pilih sub-kategori -->
<button @click="emit('select', it.key)">
```

### 3. useCatalogData.ts

```typescript
// Data produk terstruktur per kategori dan sub-kategori
const catalogProducts = {
  Kalung: {
    anak: [{ id, title, image, name, price, description, specs, images }],
    fashion: [...],
    pria: [...]
  },
  // ... kategori lainnya
}

// Helper functions
getProducts(category, subcategory) // Ambil produk
getProductDetail(category, subcategory, id) // Ambil detail produk
```

### 4. index.vue (State Management)

```typescript
// State
const showSubcategoryModal = ref(false);
const showLookbookModal = ref(false);
const showProductModal = ref(false);
const selectedCategory = ref<string | null>(null);
const selectedSubcategory = ref<string | null>(null);
const selectedProduct = ref<any>(null);
const currentProducts = ref<any[]>([]);

// Flow functions
openSubcategories(category); // Step 1
selectSubcategory(subcategory); // Step 2
openProductDetail(productId); // Step 3
```

---

## 🎨 Styling & Responsiveness

### SubcategoryModal

- **2 item:** col-12 col-md-6 (2 kolom di desktop, 1 di mobile)
- **3 item:** col-12 col-md-4 (3 kolom di desktop, 1 di mobile)
- **4 item:** col-6 col-md-3 (4 kolom di desktop, 2 di mobile)

### LookbookGrid

- **Desktop (>1200px):** 6 kolom
- **Tablet (768-1200px):** 4 kolom
- **Mobile (<768px):** 2 kolom

### ProductDetailModal

- **Desktop:** 2 kolom (gambar kiri, detail kanan)
- **Mobile:** 1 kolom (gambar atas, detail bawah)

---

## 📝 Struktur Data Produk

```typescript
{
  id: number,                    // Unique ID
  title: string,                 // Untuk grid display
  image: string,                 // Thumbnail untuk grid
  name: string,                  // Nama lengkap untuk modal
  price: string,                 // Format: "Rp 1.500.000"
  description: string,           // Deskripsi produk
  specs: string[],               // Array spesifikasi
  images: string[]               // Array gambar untuk carousel
}
```

---

## 🔧 Cara Menambah Produk Baru

### Step 1: Edit useCatalogData.ts

```typescript
// Tambahkan produk di kategori dan sub-kategori yang sesuai
Kalung: {
  fashion: [
    // ... produk existing
    {
      id: 23, // ID baru (increment dari yang terakhir)
      title: "Kalung Baru",
      image: "/img/new-necklace.jpg",
      name: "Kalung Fashion Terbaru",
      price: "Rp 4.000.000",
      description: "Deskripsi kalung baru",
      specs: ["Emas 18K", "Berat: 5 gram", "..."],
      images: ["/img/new-necklace.jpg"],
    },
  ];
}
```

### Step 2: Upload gambar

- Upload gambar ke folder `public/img/`
- Gunakan nama yang deskriptif
- Pastikan path sesuai dengan yang di data

---

## 🔧 Cara Menambah Kategori Baru

### Step 1: Update CatalogShowcase.vue

```typescript
const categories = [
  // ... existing categories
  {
    id: 7,
    title: "Kategori Baru",
    image: "/img/new-category.jpg",
    description: "Deskripsi kategori baru",
  },
];
```

### Step 2: Update SubcategoryModal.vue

```typescript
const subcategoriesMap = {
  // ... existing
  "Kategori Baru": [
    { key: "subcat1", title: "Sub 1", image: "..." },
    { key: "subcat2", title: "Sub 2", image: "..." },
  ],
};
```

### Step 3: Update useCatalogData.ts

```typescript
const catalogProducts = {
  // ... existing
  "Kategori Baru": {
    subcat1: [
      /* produk */
    ],
    subcat2: [
      /* produk */
    ],
  },
};
```

### Step 4: Update index.vue (jika perlu)

```typescript
// Tambahkan mapping title jika perlu
const subcategoryTitles = {
  // ... existing
  subcat1: "Sub Kategori 1",
  subcat2: "Sub Kategori 2",
};
```

---

## 🎯 WhatsApp Integration

Setiap produk memiliki tombol WhatsApp yang akan membuka chat dengan template:

```
Halo, saya ingin tanya produk [Nama Produk]
```

URL Format:

```
https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20tanya%20produk%20[Product Name]
```

**⚠️ PENTING:** Ganti nomor `6281234567890` dengan nomor WhatsApp bisnis yang benar di `ProductDetailModal.vue`

---

## 🐛 Troubleshooting

### Modal tidak muncul

- Cek console browser untuk error
- Pastikan event emit/listener sudah benar
- Cek state management di index.vue

### Gambar tidak muncul

- Pastikan gambar ada di folder `public/img/`
- Cek path gambar di data (harus diawali `/img/`)
- Clear cache browser

### Sub-kategori kosong

- Cek `subcategoriesMap` di SubcategoryModal.vue
- Pastikan nama kategori exact match (case-sensitive)

### Produk tidak muncul di grid

- Cek data di useCatalogData.ts
- Pastikan kategori dan sub-kategori key match
- Cek `getProducts()` function

---

## 📱 Testing Checklist

- [ ] Semua 6 kategori bisa diklik
- [ ] Modal sub-kategori muncul untuk setiap kategori
- [ ] Semua sub-kategori bisa diklik
- [ ] Grid produk muncul setelah pilih sub-kategori
- [ ] Semua produk di grid bisa diklik
- [ ] Modal detail muncul dengan data yang benar
- [ ] Carousel gambar berfungsi (jika ada multiple images)
- [ ] Tombol WhatsApp membuka chat dengan template yang benar
- [ ] Semua modal bisa ditutup (X button, backdrop click, ESC key)
- [ ] Responsive di mobile, tablet, desktop
- [ ] Kalung: 3 sub (anak, fashion, pria) ✓
- [ ] Liontin: 2 sub (anak, fashion) ✓
- [ ] Anting: 2 sub (anak, fashion) ✓
- [ ] Cincin: 3 sub (anak, fashion, pria) ✓
- [ ] Gelang: 4 sub (anak, fashion, bangle, pria) ✓
- [ ] Giwang: 2 sub (anak, fashion) ✓

---

## 🚀 Next Steps (Opsional)

1. **Integrasi dengan Supabase**

   - Pindahkan data produk ke database
   - Implement CRUD dari admin panel

2. **Filter & Search**

   - Tambah filter harga
   - Search box untuk cari produk

3. **Wishlist**

   - User bisa save produk favorit
   - Counter wishlist di header

4. **Shopping Cart**

   - Keranjang belanja
   - Checkout process

5. **Product Comparison**

   - Compare multiple products side-by-side

6. **Reviews & Ratings**
   - User reviews
   - Star ratings

---

## ✨ Selesai!

Sistem katalog produk dengan 3-level navigation sudah lengkap dan siap digunakan! 🎉

**Total:**

- ✅ 6 Kategori utama
- ✅ 16 Sub-kategori
- ✅ 22 Produk dengan detail lengkap
- ✅ 3 Level navigasi (Category → Subcategory → Product → Detail)
- ✅ Fully responsive
- ✅ WhatsApp integration
