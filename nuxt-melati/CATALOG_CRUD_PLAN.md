# 📋 RENCANA IMPLEMENTASI CRUD KATALOG PRODUK

## 🎯 Tujuan

Membuat sistem CRUD lengkap untuk katalog produk dengan:

- Upload multiple images ke Cloudinary
- Simpan data produk ke Supabase
- Management dari halaman admin dashboard
- Update real-time di frontend

---

## 📊 ANALISIS STRUKTUR DATABASE

### Tabel yang Dibutuhkan

#### 1. **catalog_categories** (Kategori Utama)

```sql
CREATE TABLE catalog_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(50) UNIQUE NOT NULL,          -- 'Kalung', 'Liontin', dll
  slug varchar(50) UNIQUE NOT NULL,          -- 'kalung', 'liontin' (untuk URL)
  description text,
  cover_image text,                          -- Cloudinary URL
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

#### 2. **catalog_subcategories** (Sub-kategori)

```sql
CREATE TABLE catalog_subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES catalog_categories(id) ON DELETE CASCADE,
  name varchar(50) NOT NULL,                 -- 'Anak', 'Fashion', 'Pria'
  slug varchar(50) NOT NULL,                 -- 'anak', 'fashion', 'pria'
  description text,
  cover_image text,                          -- Cloudinary URL
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(category_id, slug)
);
```

#### 3. **catalog_products** (Produk)

```sql
CREATE TABLE catalog_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES catalog_categories(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES catalog_subcategories(id) ON DELETE CASCADE,

  -- Basic Info
  title varchar(255) NOT NULL,               -- Untuk grid
  name varchar(255) NOT NULL,                -- Nama lengkap untuk modal
  slug varchar(255) NOT NULL,                -- URL friendly

  -- Details
  price decimal(12,2) NOT NULL,              -- Numeric untuk sorting
  price_display varchar(50),                 -- "Rp 1.500.000" (display)
  description text,

  -- Images (Array of Cloudinary URLs)
  thumbnail_image text NOT NULL,             -- Main image untuk grid
  images jsonb DEFAULT '[]'::jsonb,          -- Array of image URLs

  -- Specifications
  specs jsonb DEFAULT '[]'::jsonb,           -- Array of specs

  -- Metadata
  weight decimal(8,2),                       -- Berat dalam gram
  karat varchar(10),                         -- "18K", "22K"
  material varchar(100),                     -- "Emas", "Emas Putih"

  -- Status
  is_featured boolean DEFAULT false,         -- Untuk featured products
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  stock_status varchar(20) DEFAULT 'available', -- 'available', 'sold', 'reserved'

  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(category_id, subcategory_id, slug)
);
```

#### 4. **Indexes untuk Performance**

```sql
CREATE INDEX idx_catalog_products_category ON catalog_products(category_id, is_active);
CREATE INDEX idx_catalog_products_subcategory ON catalog_products(subcategory_id, is_active);
CREATE INDEX idx_catalog_products_featured ON catalog_products(is_featured, is_active);
CREATE INDEX idx_catalog_subcategories_category ON catalog_subcategories(category_id, is_active);
```

---

## 🗂️ STRUKTUR FILE YANG DIBUTUHKAN

### 1. Database Schema

```
database/
  ├── schema.sql (existing - update)
  └── catalog_schema.sql (new - dedicated catalog schema)
```

### 2. Composables

```
composables/
  ├── useCatalogData.ts (existing - refactor)
  ├── useCatalogManager.ts (new - CRUD operations)
  └── useCloudinary.ts (existing - enhance)
```

### 3. Admin Pages

```
pages/admin/
  ├── catalog.vue (new - main catalog management)
  └── catalog/
      ├── categories.vue (new - manage categories)
      ├── subcategories.vue (new - manage subcategories)
      └── products.vue (new - manage products)
```

### 4. Admin Components

```
components/admin/
  ├── CatalogEditModal.vue (new - add/edit product)
  ├── ImageUploadManager.vue (new - multiple image upload)
  ├── CategoryManager.vue (new - manage categories)
  └── SubcategoryManager.vue (new - manage subcategories)
```

### 5. Server API

```
server/api/
  ├── cloudinary/
  │   ├── upload.post.ts (new - upload image)
  │   ├── upload-multiple.post.ts (new - batch upload)
  │   └── delete.post.ts (existing - enhance)
  └── catalog/
      ├── sync.get.ts (new - sync initial data)
      └── migrate.post.ts (new - migrate hardcoded to DB)
```

---

## 🔄 FLOW IMPLEMENTASI

### Phase 1: Database Setup (Priority: HIGH)

1. ✅ Buat schema baru untuk katalog
2. ✅ Migrate data hardcoded ke database
3. ✅ Setup relationships dan indexes

### Phase 2: Backend Services (Priority: HIGH)

1. ✅ Update `useCloudinary.ts`:
   - Upload multiple images
   - Delete images
   - Get folder structure
2. ✅ Buat `useCatalogManager.ts`:
   - CRUD categories
   - CRUD subcategories
   - CRUD products
   - Upload & manage images

### Phase 3: Admin UI (Priority: MEDIUM)

1. ✅ Buat halaman `admin/catalog.vue`

   - Tabs: Categories, Subcategories, Products
   - List view dengan search & filter
   - Add/Edit/Delete actions

2. ✅ Buat `CatalogEditModal.vue`:

   - Form untuk add/edit product
   - Category & subcategory dropdown
   - Multiple image upload
   - Specs management (add/remove items)
   - Price formatting
   - Preview mode

3. ✅ Buat `ImageUploadManager.vue`:
   - Drag & drop upload
   - Multiple file selection
   - Image preview dengan thumbnail
   - Delete uploaded images
   - Reorder images (untuk carousel)
   - Progress bar upload

### Phase 4: Frontend Integration (Priority: MEDIUM)

1. ✅ Refactor `useCatalogData.ts`:

   - Fetch dari Supabase instead of hardcoded
   - Cache management
   - Real-time updates (optional)

2. ✅ Update components:
   - `CatalogShowcase.vue` - fetch categories
   - `SubcategoryModal.vue` - fetch subcategories
   - `LookbookGrid.vue` - fetch products
   - `ProductDetailModal.vue` - display dari DB

### Phase 5: Testing & Documentation (Priority: LOW)

1. ✅ Test CRUD operations
2. ✅ Test image upload/delete
3. ✅ Test frontend display
4. ✅ Update documentation

---

## 💾 DATA MIGRATION STRATEGY

### Step 1: Initial Data Seed

```sql
-- Insert categories
INSERT INTO catalog_categories (name, slug, description, cover_image, display_order) VALUES
('Kalung', 'kalung', 'Koleksi kalung emas elegan', '/img/necklace-cvr.jpg', 1),
('Liontin', 'liontin', 'Liontin cantik untuk penampilan istimewa', '/img/pandent2.jpg', 2),
-- ... dst
```

### Step 2: Migrate Hardcoded Data

Buat script migration yang:

1. Read data dari `useCatalogData.ts`
2. Insert ke Supabase via API endpoint
3. Upload images ke Cloudinary (jika belum)
4. Update image URLs di database

---

## 🖼️ CLOUDINARY FOLDER STRUCTURE

```
melati-gold/
├── catalog/
│   ├── categories/
│   │   ├── kalung.jpg
│   │   ├── liontin.jpg
│   │   └── ...
│   ├── subcategories/
│   │   ├── kalung-anak.jpg
│   │   ├── kalung-fashion.jpg
│   │   └── ...
│   └── products/
│       ├── kalung/
│       │   ├── anak/
│       │   │   ├── product-1-main.jpg
│       │   │   ├── product-1-detail-1.jpg
│       │   │   └── product-1-detail-2.jpg
│       │   └── fashion/
│       └── liontin/
```

**Benefits:**

- Organized structure
- Easy to find images
- Can apply transformations per folder
- Easy backup/restore

---

## 📝 API ENDPOINTS YANG DIBUTUHKAN

### Cloudinary API

```typescript
// POST /api/cloudinary/upload
// Upload single image
{
  file: File,
  folder: string,
  public_id?: string
}

// POST /api/cloudinary/upload-multiple
// Upload multiple images
{
  files: File[],
  folder: string
}

// POST /api/cloudinary/delete
// Delete image(s)
{
  public_ids: string[]
}
```

### Catalog API

```typescript
// GET /api/catalog/categories
// Get all categories

// GET /api/catalog/subcategories?category_id=xxx
// Get subcategories by category

// GET /api/catalog/products?category_id=xxx&subcategory_id=yyy
// Get products by category and subcategory

// POST /api/catalog/migrate
// Migrate hardcoded data to database (one-time)
```

---

## 🎨 ADMIN UI MOCKUP

### Halaman: /admin/catalog

```
┌─────────────────────────────────────────────────────────────┐
│  Catalog Management                              [+ Add New] │
├─────────────────────────────────────────────────────────────┤
│  [Categories] [Subcategories] [Products]                    │
├─────────────────────────────────────────────────────────────┤
│  Search: [_______________]  Filter: [Category ▼]            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [IMG] Kalung Fashion Modern         Rp 3.500.000    │   │
│  │       Kalung › Fashion                               │   │
│  │       Emas 18K • 4.5gr                      [Edit] [Del] │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [IMG] Cincin Berlian Premium        Rp 4.500.000    │   │
│  │       Cincin › Fashion                               │   │
│  │       Emas 18K • 3.8gr                      [Edit] [Del] │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Modal: Edit Product

```
┌──────────────────────────────────────────────────────┐
│  Edit Product                                    [×] │
├──────────────────────────────────────────────────────┤
│  Category:      [Kalung ▼]                          │
│  Subcategory:   [Fashion ▼]                         │
│                                                      │
│  Title:         [Kalung Fashion Modern___________]  │
│  Full Name:     [Kalung Fashion Modern Elegan___]   │
│  Price:         [3500000_____]  = Rp 3.500.000      │
│                                                      │
│  Description:                                        │
│  [________________________________________]          │
│  [________________________________________]          │
│                                                      │
│  Specifications:                     [+ Add Spec]    │
│  • Emas 18K                                [Remove]  │
│  • Berat: 4.5 gram                         [Remove]  │
│  • Panjang: 45cm                           [Remove]  │
│                                                      │
│  Images:                        [+ Upload Images]    │
│  ┌────┐ ┌────┐ ┌────┐                               │
│  │ 📷 │ │ 📷 │ │ 📷 │  (drag to reorder)            │
│  └────┘ └────┘ └────┘                               │
│   [×]    [×]    [×]   (click X to delete)           │
│                                                      │
│  [Cancel]                              [Save]       │
└──────────────────────────────────────────────────────┘
```

---

## 🔒 SECURITY CONSIDERATIONS

### 1. Authentication

- All catalog CRUD endpoints require admin authentication
- Verify `isLoggedIn` and `role` from localStorage/session

### 2. Image Upload

- Validate file type (jpg, jpeg, png, webp only)
- Limit file size (max 5MB per image)
- Sanitize filenames
- Use signed uploads for Cloudinary

### 3. Data Validation

- Server-side validation for all inputs
- SQL injection prevention (use parameterized queries)
- XSS prevention (sanitize HTML inputs)
- Price validation (positive numbers only)

### 4. Rate Limiting

- Limit upload frequency
- Max 10 images per product
- Prevent spam submissions

---

## 📊 DATA FLOW DIAGRAM

```
┌──────────────┐
│   Admin UI   │
│ (catalog.vue)│
└──────┬───────┘
       │
       │ 1. Select image files
       ↓
┌──────────────────────┐
│ ImageUploadManager   │
│ - Preview images     │
│ - Validate files     │
└──────┬───────────────┘
       │
       │ 2. Upload to Cloudinary
       ↓
┌──────────────────────┐
│ useCloudinary.ts     │
│ - uploadMultiple()   │
│ - Returns URLs       │
└──────┬───────────────┘
       │
       │ 3. Get image URLs
       ↓
┌──────────────────────┐
│ CatalogEditModal     │
│ - Collect form data  │
│ - Include image URLs │
└──────┬───────────────┘
       │
       │ 4. Submit product data
       ↓
┌──────────────────────┐
│ useCatalogManager.ts │
│ - createProduct()    │
│ - Save to Supabase   │
└──────┬───────────────┘
       │
       │ 5. Success response
       ↓
┌──────────────────────┐
│   Frontend Cache     │
│ - Update local data  │
│ - Refresh display    │
└──────────────────────┘
```

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1: Database & Backend

- Day 1-2: Create schema, setup tables
- Day 3-4: Build `useCatalogManager.ts`
- Day 5: Enhance `useCloudinary.ts`
- Day 6-7: Create API endpoints, testing

### Week 2: Admin UI

- Day 1-2: Build `catalog.vue` main page
- Day 3-4: Build `CatalogEditModal.vue`
- Day 5: Build `ImageUploadManager.vue`
- Day 6-7: Integration testing

### Week 3: Frontend Integration

- Day 1-2: Refactor `useCatalogData.ts`
- Day 3-4: Update all components
- Day 5: Data migration from hardcoded
- Day 6-7: End-to-end testing

### Week 4: Polish & Documentation

- Day 1-3: Bug fixes, optimization
- Day 4-5: Write documentation
- Day 6-7: Final testing, deployment prep

---

## 📋 CHECKLIST IMPLEMENTASI

### Database

- [ ] Create `catalog_categories` table
- [ ] Create `catalog_subcategories` table
- [ ] Create `catalog_products` table
- [ ] Create indexes
- [ ] Seed initial categories
- [ ] Migrate hardcoded product data

### Backend

- [ ] Enhance `useCloudinary.ts` for multiple uploads
- [ ] Create `useCatalogManager.ts` composable
- [ ] Create upload API endpoints
- [ ] Create delete image endpoint
- [ ] Add server-side validation

### Admin UI

- [ ] Create `admin/catalog.vue` page
- [ ] Create `CatalogEditModal.vue` component
- [ ] Create `ImageUploadManager.vue` component
- [ ] Add to dashboard navigation
- [ ] Implement search & filter
- [ ] Add bulk actions (optional)

### Frontend

- [ ] Refactor `useCatalogData.ts` to fetch from DB
- [ ] Update `CatalogShowcase.vue`
- [ ] Update `SubcategoryModal.vue`
- [ ] Update `LookbookGrid.vue`
- [ ] Update `ProductDetailModal.vue`
- [ ] Add loading states
- [ ] Add error handling

### Testing

- [ ] Test image upload (single & multiple)
- [ ] Test image deletion
- [ ] Test product CRUD operations
- [ ] Test category management
- [ ] Test subcategory management
- [ ] Test frontend display
- [ ] Test mobile responsiveness
- [ ] Performance testing

### Documentation

- [ ] Update CATALOG_DOCUMENTATION.md
- [ ] Create CRUD_GUIDE.md
- [ ] Update README.md
- [ ] Add code comments
- [ ] Create video tutorial (optional)

---

## 🎯 SUCCESS CRITERIA

1. ✅ Admin dapat menambah produk baru dengan multiple images
2. ✅ Images tersimpan di Cloudinary dengan struktur folder yang rapi
3. ✅ Data produk tersimpan di Supabase
4. ✅ Admin dapat edit dan delete produk
5. ✅ Frontend menampilkan data dari database (real-time)
6. ✅ Image upload berfungsi dengan drag & drop
7. ✅ System responsive di semua devices
8. ✅ Performance tetap optimal (< 2s load time)

---

## 🔧 TEKNOLOGI YANG DIGUNAKAN

- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Cloudinary
- **Frontend**: Nuxt 3 + Vue 3 + TypeScript
- **Styling**: Tailwind CSS + Bootstrap Icons
- **Upload**: Cloudinary Upload Widget / Direct API
- **Forms**: Vue reactivity + Vuelidate (optional)

---

## 📚 RESOURCES & REFERENCES

- [Supabase CRUD Operations](https://supabase.com/docs/guides/database/tables)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Cloudinary Delete API](https://cloudinary.com/documentation/admin_api#delete_resources)
- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [Vue 3 File Upload](https://vuejs.org/guide/essentials/forms.html#file-input)

---

## ✨ NEXT: Mari Mulai Implementasi!

**Prioritas pertama:**

1. ✅ Update database schema
2. ✅ Buat `useCatalogManager.ts`
3. ✅ Enhance `useCloudinary.ts`
4. ✅ Buat halaman `admin/catalog.vue`

Apakah Anda siap untuk mulai implementasi? 🚀
