# 🗺️ CATALOG CRUD - ARCHITECTURE DIAGRAM

## 📐 Database Schema Relationship

```
┌─────────────────────────┐
│  catalog_categories     │
│─────────────────────────│
│ • id (PK)               │
│ • name                  │
│ • slug                  │
│ • cover_image           │
│ • display_order         │
│ • is_active             │
└───────────┬─────────────┘
            │ 1
            │
            │ has many
            │
            ↓ N
┌─────────────────────────┐
│ catalog_subcategories   │
│─────────────────────────│
│ • id (PK)               │
│ • category_id (FK)      │───┐
│ • name                  │   │
│ • slug                  │   │
│ • cover_image           │   │
│ • display_order         │   │
│ • is_active             │   │
└───────────┬─────────────┘   │
            │ 1                │
            │                  │
            │ has many         │
            │                  │
            ↓ N                │
┌─────────────────────────┐   │
│   catalog_products      │   │
│─────────────────────────│   │
│ • id (PK)               │   │
│ • category_id (FK)      │───┘
│ • subcategory_id (FK)   │
│ • title                 │
│ • name                  │
│ • price                 │
│ • thumbnail_image       │
│ • images (JSONB Array)  │
│ • specs (JSONB Array)   │
│ • weight, karat         │
│ • is_featured           │
│ • is_active             │
│ • stock_status          │
└─────────────────────────┘
```

## 🔄 CRUD Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                       │
│                     /admin/catalog.vue                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Categories   │    │Subcategories │    │  Products    │
│  Manager     │    │   Manager    │    │   Manager    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ↓
                ┌──────────────────────┐
                │  CatalogEditModal    │
                │  - Form Fields       │
                │  - Image Upload      │
                │  - Validation        │
                └──────────┬───────────┘
                           │
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ImageUpload    │  │useCatalog     │  │useCloudinary  │
│Manager        │  │Manager        │  │               │
│- Preview      │  │- CRUD Ops     │  │- Upload       │
│- Drag&Drop    │  │- Validation   │  │- Delete       │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Cloudinary   │  │   Supabase    │  │  Frontend     │
│  Storage      │  │   Database    │  │  Display      │
└───────────────┘  └───────────────┘  └───────────────┘
```

## 🖼️ Image Upload Flow

```
User Action                   System Process                   Storage
─────────────────────────────────────────────────────────────────────

1. Select Files
   [📁 Choose]
                    ─────────→  Validate Files
                                • Type check
                                • Size check
                                • Count check

2. Preview Images
   [🖼️ Preview]
                    ─────────→  Generate Previews
                                • Base64 thumbnails
                                • Show dimensions

3. Click Upload
   [⬆️ Upload]
                    ─────────→  Upload to Cloudinary
                                • Folder structure
                                • Transformations
                                • Progress tracking
                                                        ─────→ Cloudinary
                                                              /melati-gold
                                                              /catalog
                                                              /products

4. Get URLs
   [✅ Success]
                    ←─────────  Return Image URLs
                                • Public URLs
                                • Secure URLs
                                • Public IDs

5. Save Product
   [💾 Save]
                    ─────────→  Save to Database
                                • Product data
                                • Image URLs array
                                • Thumbnail URL
                                                        ─────→ Supabase
                                                              catalog_products
                                                              table
```

## 📱 Frontend Display Flow

```
User Navigation              Data Fetch                    Display
────────────────────────────────────────────────────────────────────

1. Open Website
   [🏠 Homepage]
                    ─────────→ Fetch Categories
                                useCatalogData.ts
                                getCategories()
                                                    ←───── Supabase

2. View Catalog
   [📋 Catalog]
                    ─────────→ Display Grid
                                CatalogShowcase.vue
                                - 6 category cards

3. Click Category
   [👆 Kalung]
                    ─────────→ Fetch Subcategories
                                getSubcategories()
                                                    ←───── Supabase

4. Show Modal
   [📋 Subcategory]
                    ─────────→ Display Options
                                SubcategoryModal.vue
                                - Anak, Fashion, Pria

5. Select Subcat
   [👆 Fashion]
                    ─────────→ Fetch Products
                                getProducts()
                                                    ←───── Supabase

6. Show Grid
   [📋 Products]
                    ─────────→ Display Grid
                                LookbookGrid.vue
                                - Product cards

7. Click Product
   [👆 Product]
                    ─────────→ Show Detail
                                ProductDetailModal.vue
                                - Carousel images
                                - Specs, price
                                - WhatsApp button
```

## 🔐 Security & Validation Flow

```
┌───────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE                                │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Form Validation                                           │
│     ✓ Required fields                                         │
│     ✓ Format validation (email, price, etc)                   │
│     ✓ Client-side file checks                                 │
│                                                                │
│  2. Image Validation                                          │
│     ✓ File type (jpg, png, webp only)                         │
│     ✓ File size (max 5MB)                                     │
│     ✓ Image count (max 10)                                    │
│                                                                │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ HTTP Request
                         │ (with auth token)
                         ↓
┌───────────────────────────────────────────────────────────────┐
│                     SERVER SIDE                                │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Authentication Check                                       │
│     ✓ Verify login status                                     │
│     ✓ Verify admin role                                       │
│     ✓ Check session expiry                                    │
│                                                                │
│  2. Authorization Check                                        │
│     ✓ Can user perform this action?                           │
│     ✓ Rate limiting check                                     │
│                                                                │
│  3. Input Sanitization                                         │
│     ✓ Remove malicious code                                   │
│     ✓ SQL injection prevention                                │
│     ✓ XSS prevention                                          │
│                                                                │
│  4. Business Logic Validation                                  │
│     ✓ Duplicate check                                         │
│     ✓ Foreign key validation                                  │
│     ✓ Price range validation                                  │
│                                                                │
│  5. Database Transaction                                       │
│     ✓ Begin transaction                                       │
│     ✓ Execute query                                           │
│     ✓ Commit or rollback                                      │
│                                                                │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ Response
                         │ (success/error)
                         ↓
┌───────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE                                │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Handle Response                                           │
│     ✓ Update UI on success                                    │
│     ✓ Show error message on failure                           │
│     ✓ Refresh data cache                                      │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## 📊 Data State Management

```
┌────────────────────────────────────────────────────────┐
│                   Global State                          │
│                (Composables)                            │
├────────────────────────────────────────────────────────┤
│                                                         │
│  useCatalogData                                        │
│  ├─ categories (ref<Category[]>)                       │
│  ├─ subcategories (ref<Subcategory[]>)                 │
│  ├─ products (ref<Product[]>)                          │
│  ├─ loading (ref<boolean>)                             │
│  ├─ error (ref<string|null>)                           │
│  └─ cache (Map<string, any>)                           │
│                                                         │
│  Methods:                                               │
│  ├─ getCategories() → fetch & cache                    │
│  ├─ getSubcategories(categoryId)                       │
│  ├─ getProducts(categoryId, subcategoryId)             │
│  ├─ getProductDetail(id)                               │
│  └─ refreshCache()                                      │
│                                                         │
└───────────────────────┬────────────────────────────────┘
                        │
                        │ provides data to
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Public Pages │ │ Admin Pages  │ │ Components   │
│              │ │              │ │              │
│ - index.vue  │ │ - catalog    │ │ - Catalog    │
│ - Catalog    │ │ - Products   │ │   Showcase   │
│   pages      │ │   manager    │ │ - Lookbook   │
│              │ │              │ │ - Modals     │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Supabase   │     │  Cloudinary  │
│   (Hosting)  │────▶│  (Database)  │     │   (CDN)      │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │                    │                     │
       │  API Calls         │  SQL Queries        │  Image URLs
       │                    │                     │
       ↓                    ↓                     ↓
┌─────────────────────────────────────────────────────────┐
│                    Nuxt 3 Application                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │Composables │  │ Components │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    API     │  │Middleware  │  │   Plugins  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘

Environment Variables:
├─ SUPABASE_URL
├─ SUPABASE_ANON_KEY
├─ CLOUDINARY_CLOUD_NAME
├─ CLOUDINARY_API_KEY
├─ CLOUDINARY_API_SECRET
└─ CLOUDINARY_UPLOAD_PRESET
```

---

## 📝 Summary

Arsitektur ini dirancang untuk:

- ✅ **Scalability**: Mudah menambah kategori/produk baru
- ✅ **Maintainability**: Kode terstruktur dengan separation of concerns
- ✅ **Security**: Multiple layers of validation dan authentication
- ✅ **Performance**: Caching, lazy loading, optimized queries
- ✅ **User Experience**: Intuitive admin UI, fast frontend loading
- ✅ **SEO Friendly**: Dynamic data dengan proper meta tags

Ready untuk implementasi! 🚀
