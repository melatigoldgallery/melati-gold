# Quick Start Guide - After Migration

## 🚀 Setup (First Time)

### 1. Run Database Migration

```sql
-- Open Supabase SQL Editor and run:
-- File: database/migration_add_slug_fields.sql
```

### 2. Verify Slugs Generated

```sql
-- Check categories have slugs:
SELECT id, name, slug FROM catalog_categories;

-- If any slug is NULL, update manually:
UPDATE catalog_categories
SET slug = 'cincin'
WHERE name = 'Cincin';
```

### 3. Update WhatsApp Number

Edit `components/product/ProductInfo.vue`:

```typescript
// Line 39 & 48
const whatsappNumber = "6281234567890"; // ← Change this!
```

---

## 🔗 New URL Structure

### Homepage

```
http://localhost:3000/
```

### Catalog Pages

```
http://localhost:3000/catalog/cincin
http://localhost:3000/catalog/gelang
http://localhost:3000/catalog/kalung
```

### Catalog with Filters (auto-generated)

```
http://localhost:3000/catalog/cincin?subcategory=tunangan
http://localhost:3000/catalog/cincin?price_min=5000000&price_max=10000000
http://localhost:3000/catalog/cincin?karat=18k&sort=price-asc
```

### Product Detail

```
http://localhost:3000/product/{product-id}
```

---

## 🧪 Testing Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 User Flow

### Old Flow (Deleted)

```
Homepage
  → Click Category
    → SubcategoryModal opens
      → Click Subcategory
        → LookbookModal opens
          → Click Product
            → ProductDetailModal opens
```

### New Flow (Current)

```
Homepage
  → Click Category
    → Navigate to /catalog/[category]
      → Filter by subcategory (sidebar)
        → Click Product
          → Navigate to /product/[id]
```

---

## 🛠️ Common Tasks

### Add New Category

1. Go to Admin Dashboard
2. Add category with name
3. **Slug will auto-generate** (e.g., "Cincin Berlian" → "cincin-berlian")
4. Category will appear at: `/catalog/cincin-berlian`

### Change Category URL

```sql
-- Update slug in database:
UPDATE catalog_categories
SET slug = 'new-slug'
WHERE id = 'category-id';

-- Clear cache (optional):
-- Restart dev server or wait 10 minutes
```

### Debug Product Not Found

```typescript
// Check product ID in URL
// Open browser console → Network tab
// Look for API call to getProductById
// Verify product exists and is_active = true
```

---

## 🎨 Customization Points

### Filter Options

Edit `components/catalog/FilterSidebar.vue`:

- Line 66: Price ranges
- Line 76: Karat options
- Line 84: Sort options

### Product Grid Layout

Edit `components/catalog/ProductGrid.vue`:

- Line 45: Grid columns (2/3/4)
- Line 47: Card aspect ratio
- Line 60: Hover effects

### Product Page Layout

Edit `components/product/ProductInfo.vue`:

- Line 36: WhatsApp message template
- Line 44: Custom order message
- Line 103: CTA button styles

---

## 🐛 Troubleshooting

### "Category not found" Error

**Cause:** Slug doesn't exist in database  
**Fix:** Run migration or add slug manually

### Images Not Loading

**Cause:** Cloudinary URLs or local images missing  
**Fix:** Check product.thumbnail_image or product.images array

### Filters Not Working

**Cause:** URL query params not updating  
**Fix:** Check browser console for errors in FilterSidebar.vue

### Related Products Empty

**Cause:** No products in same category/subcategory  
**Fix:** Add more products or adjust logic in getRelatedProducts()

---

## 📊 Performance Tips

### Enable Caching (Recommended)

Add to `nuxt.config.ts`:

```typescript
routeRules: {
  '/catalog/**': { swr: 3600 },  // 1 hour
  '/product/**': { swr: 7200 }   // 2 hours
}
```

### Optimize Images

All Cloudinary images auto-optimized:

- WebP format
- Lazy loading
- Responsive sizes

### Preload Critical Data

Already implemented in pages using `await` in `<script setup>`

---

## 📚 Documentation

- **Full Migration Plan:** `doc/MIGRATION_STRATEGY_A_HYBRID_PAGES.md`
- **Completion Summary:** `doc/MIGRATION_COMPLETED_SUMMARY.md`
- **This Guide:** `doc/QUICK_START_AFTER_MIGRATION.md`

---

## ✅ Launch Checklist

Before deploying to production:

- [ ] Database migration completed
- [ ] All slugs generated and verified
- [ ] WhatsApp number updated
- [ ] All pages tested (homepage, catalog, product)
- [ ] Filters tested on catalog page
- [ ] Product navigation tested
- [ ] Browser back button tested
- [ ] Mobile responsive checked
- [ ] SEO meta tags verified (view page source)
- [ ] Open Graph tested (share on WhatsApp)
- [ ] Lighthouse score > 90
- [ ] No console errors

---

**Ready to go! 🚀**
