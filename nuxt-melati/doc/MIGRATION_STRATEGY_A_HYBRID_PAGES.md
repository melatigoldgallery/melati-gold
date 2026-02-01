# Migration Plan: Strategy A - Hybrid Modal + Dedicated Pages

**Document Version:** 1.0  
**Date:** February 1, 2026  
**Status:** Planning Phase

---

## 📋 Executive Summary

Migrasi dari **modal-based navigation** ke **dedicated pages** dengan optional quick view modal untuk meningkatkan SEO, user experience, dan shareability.

### Current State (Before Migration)

```
Homepage → Modal Subcategory → Modal Product Grid → Modal Product Detail
❌ 3 clicks to reach product
❌ No URL routing
❌ No SEO
❌ Modal stacking (bad UX)
❌ No shareable links
```

### Target State (After Migration)

```
Homepage → /catalog/[category] → /product/[id]
✅ 2 clicks to reach product
✅ Full URL routing
✅ SEO-friendly
✅ Clean navigation
✅ Shareable product links
✅ Browser back button works
```

---

## 🎯 Strategic Goals

1. **SEO Optimization**
   - Every product has its own URL
   - Meta tags for social sharing
   - Server-side rendering (SSR) support

2. **Improved UX**
   - Reduce clicks from 3 to 2
   - Natural browser navigation
   - No modal stacking confusion
   - Better mobile experience

3. **Shareability**
   - Users can share product links
   - Deep linking support
   - Bookmark-friendly

4. **Performance**
   - Better caching strategy
   - Pre-rendering catalog pages
   - Faster perceived load time

5. **Analytics & Tracking**
   - Track page views per product
   - Better conversion funnel analysis
   - User journey mapping

---

## 🏗️ Architecture Comparison

### OLD Architecture (Modal-Based)

```
components/
├─ CatalogShowcase.vue          → Opens modal
├─ SubcategoryModal.vue         → Opens another modal
├─ LookbookGrid.vue             → Inside modal
└─ ProductDetailModal.vue       → Inside modal

pages/
└─ index.vue                    → All logic here (200+ lines)

Flow: Modal → Modal → Modal
URL: / (no changes)
```

### NEW Architecture (Page-Based)

```
components/
├─ CatalogShowcase.vue          → Navigates to page
├─ catalog/
│  ├─ FilterSidebar.vue         → NEW: Filters & subcategories
│  ├─ ProductGrid.vue           → Reuse LookbookGrid logic
│  └─ QuickViewModal.vue        → NEW: Optional quick preview
└─ product/
   ├─ ProductGallery.vue        → NEW: Large image carousel
   ├─ ProductInfo.vue           → NEW: Details & specs
   └─ RelatedProducts.vue       → NEW: Recommendations

pages/
├─ index.vue                    → Clean, focused (< 100 lines)
├─ catalog/
│  └─ [category].vue            → NEW: Full catalog page
└─ product/
   └─ [id].vue                  → NEW: Full product detail

Flow: Page → Page → Page
URL: / → /catalog/cincin → /product/abc123
```

---

## 📂 File Changes Detailed

### ✅ Files to CREATE

#### 1. **pages/catalog/[category].vue**

**Purpose:** Display all products in a category with filtering  
**Features:**

- Dynamic route parameter: `/catalog/cincin`, `/catalog/gelang`
- Filter sidebar: subcategory, price range, karat
- Product grid with pagination/infinite scroll
- SEO meta tags per category
- Breadcrumb: Home > Catalog > Category

**Key Functions:**

```typescript
- fetchCategoryData(categorySlug)
- fetchProducts(filters)
- handleFilterChange()
- handleProductClick() → navigate to /product/[id]
```

#### 2. **pages/product/[id].vue**

**Purpose:** Full product detail page  
**Features:**

- Dynamic route: `/product/abc123`
- Large image gallery (swipeable)
- Complete product information
- Price calculation with karat config
- CTA buttons (WhatsApp, Custom Order)
- Related products section
- SEO meta tags with Open Graph

**Key Functions:**

```typescript
-fetchProductById(productId) - calculatePrice(karat, weight) - handleContactClick() - loadRelatedProducts();
```

#### 3. **components/catalog/FilterSidebar.vue**

**Purpose:** Filter products by subcategory, price, etc.  
**Features:**

- Subcategory checkboxes
- Price range slider
- Karat selection
- Sort options
- Clear filters button
- Mobile: collapsible drawer

#### 4. **components/catalog/ProductGrid.vue**

**Purpose:** Reusable product grid component  
**Features:**

- Grid layout (responsive: 2/4/6 columns)
- Product card with hover effects
- Lazy loading images
- "Quick View" button
- Navigate to product page on click

#### 5. **components/catalog/QuickViewModal.vue** (Optional)

**Purpose:** Quick preview without leaving catalog page  
**Features:**

- Lightweight modal (not fullscreen)
- Basic product info
- 2-3 images only
- "View Full Details" → navigate to /product/[id]
- Close button

#### 6. **components/product/ProductGallery.vue**

**Purpose:** Large image carousel for product page  
**Features:**

- Main large image
- Thumbnail strip below
- Zoom on hover (desktop)
- Swipe gestures (mobile)
- Fullscreen lightbox option

#### 7. **components/product/ProductInfo.vue**

**Purpose:** Product details section  
**Features:**

- Product name & description
- Price display
- Specifications table
- Stock status
- CTA buttons

#### 8. **components/product/RelatedProducts.vue**

**Purpose:** Product recommendations  
**Features:**

- "You might also like" section
- 4-6 related products
- Same category or subcategory
- Carousel on mobile

---

### 🔄 Files to MODIFY

#### 1. **components/CatalogShowcase.vue**

**Changes:**

- Remove `@open-subcategories` emit
- Change click handler to navigate:

  ```typescript
  // OLD
  @click="emit('open-subcategories', category)"

  // NEW
  @click="navigateTo(`/catalog/${category.slug}`)"
  ```

#### 2. **pages/index.vue**

**Changes:**

- Remove all modal state management (50+ lines)
- Remove modal components imports
- Clean up event handlers
- Focus on homepage content only

**Remove:**

```typescript
- showSubcategoryModal
- showLookbookModal
- showProductModal
- selectedCategory
- selectedSubcategory
- currentProducts
- All modal open/close functions
```

#### 3. **composables/useCatalogData.ts** or **useCatalogManager.ts**

**Add new functions:**

```typescript
// Fetch by category slug (for routing)
export function getCategoryBySlug(slug: string);

// Fetch products with filters
export function getProductsWithFilters(categoryId, filters);

// Fetch related products
export function getRelatedProducts(productId, limit = 6);
```

---

### ❌ Files to DELETE

#### 1. **components/SubcategoryModal.vue**

**Reason:** Subcategories now shown in FilterSidebar on catalog page

#### 2. **components/ProductDetailModal.vue**

**Reason:** Product details now on dedicated page `/product/[id]`

#### 3. **components/LookbookGrid.vue**

**Decision:** Merge into new ProductGrid.vue with enhanced features  
**Alternative:** Keep and refactor if you prefer

---

## 🗺️ URL Structure & Routing

### New Routes

| Route                                 | Purpose                 | Example                                |
| ------------------------------------- | ----------------------- | -------------------------------------- |
| `/`                                   | Homepage                | Landing page                           |
| `/catalog/:category`                  | Category page           | `/catalog/cincin`                      |
| `/catalog/:category?subcategory=:sub` | Filtered by subcategory | `/catalog/cincin?subcategory=tunangan` |
| `/product/:id`                        | Product detail          | `/product/abc123xyz`                   |

### Route Parameters

**Category Page:**

```typescript
// URL: /catalog/cincin?subcategory=tunangan&price_min=5000000&karat=18k

const route = useRoute();
const categorySlug = route.params.category;
const filters = {
  subcategory: route.query.subcategory,
  price_min: route.query.price_min,
  karat: route.query.karat,
};
```

**Product Page:**

```typescript
// URL: /product/abc123xyz

const route = useRoute();
const productId = route.params.id;
```

---

## 📊 Database Schema Requirements

### Add Slug Fields (If Not Exist)

**catalog_categories table:**

```sql
ALTER TABLE catalog_categories
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs from existing names
UPDATE catalog_categories
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
```

**catalog_subcategories table:**

```sql
ALTER TABLE catalog_subcategories
ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE catalog_subcategories
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
```

**catalog_products table:**

```sql
-- Ensure we can query by ID efficiently
CREATE INDEX IF NOT EXISTS idx_products_id ON catalog_products(id);
CREATE INDEX IF NOT EXISTS idx_products_category ON catalog_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON catalog_products(subcategory_id);
```

---

## 🔍 SEO Implementation

### Meta Tags Template

**Category Page (`catalog/[category].vue`):**

```vue
<script setup lang="ts">
const route = useRoute();
const category = await fetchCategory(route.params.category);

useHead({
  title: `${category.name} - Melati Gold Shop`,
  meta: [
    { name: "description", content: category.description },
    { property: "og:title", content: category.name },
    { property: "og:description", content: category.description },
    { property: "og:image", content: category.cover_image },
    { property: "og:type", content: "website" },
  ],
});
</script>
```

**Product Page (`product/[id].vue`):**

```vue
<script setup lang="ts">
const route = useRoute();
const product = await fetchProduct(route.params.id);

useHead({
  title: `${product.name} - Melati Gold Shop`,
  meta: [
    { name: "description", content: product.description },
    { property: "og:title", content: product.name },
    { property: "og:description", content: product.description },
    { property: "og:image", content: product.images[0] },
    { property: "og:type", content: "product" },
    { property: "product:price:amount", content: product.price },
    { property: "product:price:currency", content: "IDR" },
  ],
  link: [{ rel: "canonical", href: `https://melatigoldshop.com/product/${product.id}` }],
});
</script>
```

---

## 🎨 UI/UX Design Guidelines

### Breadcrumb Navigation

**Required on all pages:**

```
Home > Catalog > Cincin > Cincin Tunangan > Product Name
```

### Filter Sidebar (Catalog Page)

**Desktop:** Fixed left sidebar (300px width)  
**Mobile:** Collapsible bottom drawer with "Filter" button

**Filter Options:**

1. Sub-kategori (checkboxes)
2. Price range (slider: min-max)
3. Karat (radio: 8k, 14k, 18k, 22k, 24k)
4. Sort by (dropdown: Newest, Price Low-High, Price High-Low, Popular)

### Product Grid Layout

- **Desktop (>1200px):** 4 columns
- **Tablet (768-1200px):** 3 columns
- **Mobile (<768px):** 2 columns

### Product Card Design

```
┌─────────────────┐
│                 │
│     Image       │ (aspect-ratio: 4/5)
│    (hover)      │
├─────────────────┤
│ Product Name    │
│ Rp 5.000.000    │
│ [Quick View]    │ (optional)
└─────────────────┘
```

---

## 🚀 Migration Checklist

### Phase 1: Preparation

- [ ] Backup current codebase
- [ ] Add slug columns to database
- [ ] Generate slugs for all categories
- [ ] Test category slug uniqueness
- [ ] Create migration branch: `feature/strategy-a-migration`

### Phase 2: Create Core Pages

- [ ] Create `pages/catalog/[category].vue`
- [ ] Create `pages/product/[id].vue`
- [ ] Test routing with sample data
- [ ] Verify SSR works correctly

### Phase 3: Create New Components

- [ ] `components/catalog/FilterSidebar.vue`
- [ ] `components/catalog/ProductGrid.vue`
- [ ] `components/product/ProductGallery.vue`
- [ ] `components/product/ProductInfo.vue`
- [ ] `components/product/RelatedProducts.vue`

### Phase 4: Update Existing Components

- [ ] Modify `CatalogShowcase.vue` (remove emit, add navigation)
- [ ] Simplify `pages/index.vue` (remove modal logic)
- [ ] Update `useCatalogManager.ts` (add new functions)

### Phase 5: Cleanup

- [ ] Delete `SubcategoryModal.vue`
- [ ] Delete `ProductDetailModal.vue`
- [ ] Delete or refactor `LookbookGrid.vue`
- [ ] Remove unused modal state from index.vue

### Phase 6: SEO & Polish

- [ ] Add meta tags to all pages
- [ ] Implement breadcrumb component
- [ ] Add structured data (JSON-LD)
- [ ] Test Open Graph sharing
- [ ] Add canonical URLs

### Phase 7: Testing

- [ ] Test all navigation flows
- [ ] Test browser back button
- [ ] Test URL sharing
- [ ] Test mobile responsiveness
- [ ] Test filter functionality
- [ ] Performance testing (Lighthouse)
- [ ] SEO audit (Google Search Console)

### Phase 8: Deployment

- [ ] Deploy to staging
- [ ] UAT (User Acceptance Testing)
- [ ] Fix bugs found in UAT
- [ ] Deploy to production
- [ ] Monitor analytics

---

## 🧪 Testing Plan

### Manual Testing Scenarios

**Scenario 1: Browse Category**

1. Go to homepage
2. Click "Cincin" category
3. Verify URL: `/catalog/cincin`
4. Verify products load
5. Verify filters work
6. Click product → verify navigates to `/product/[id]`

**Scenario 2: Direct URL Access**

1. Open browser
2. Type: `melatigoldshop.com/catalog/gelang`
3. Verify page loads correctly
4. Verify breadcrumb shows correct path

**Scenario 3: Product Detail**

1. Navigate to product page
2. Verify images load
3. Test image carousel
4. Test WhatsApp button
5. Click "Related Products" → verify navigation

**Scenario 4: Browser Navigation**

1. Browse: Home → Catalog → Product
2. Click browser back button
3. Verify returns to catalog page
4. Click back again → verify returns to home

**Scenario 5: Share Link**

1. Copy product URL
2. Paste in new incognito tab
3. Verify product loads
4. Verify meta tags for social sharing

### Automated Testing

**Unit Tests:**

```typescript
// useCatalogManager.test.ts
describe("getCategoryBySlug", () => {
  it("should return category for valid slug", async () => {
    const result = await getCategoryBySlug("cincin");
    expect(result.success).toBe(true);
    expect(result.data.name).toBe("Cincin");
  });
});
```

**E2E Tests:**

```typescript
// catalog.spec.ts (Playwright/Cypress)
test("navigate from home to product detail", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Cincin");
  await expect(page).toHaveURL(/\/catalog\/cincin/);
  await page.click(".product-card:first-child");
  await expect(page).toHaveURL(/\/product\/[a-z0-9]+/);
});
```

---

## 📈 Success Metrics

### KPIs to Track

**Before vs After Comparison:**

| Metric                   | Before (Modal) | Target (Pages)     |
| ------------------------ | -------------- | ------------------ |
| Clicks to Product Detail | 3              | 2                  |
| Bounce Rate              | ~65%           | <50%               |
| Avg Session Duration     | 2 min          | >3 min             |
| SEO Indexed Pages        | 1 (homepage)   | 50+ (all products) |
| Mobile Conversion        | Baseline       | +20%               |
| Page Load Time           | 2.5s           | <2s                |

### Analytics Events to Track

```typescript
// Google Analytics 4 Events
gtag("event", "view_item_list", {
  item_list_id: "catalog_cincin",
  item_list_name: "Cincin Category",
});

gtag("event", "view_item", {
  items: [
    {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
    },
  ],
});

gtag("event", "select_item", {
  items: [
    {
      item_id: product.id,
      item_name: product.name,
    },
  ],
});
```

---

## 🔧 Technical Considerations

### Performance Optimization

**1. Image Optimization:**

```typescript
// Use Nuxt Image module
<NuxtImg
  :src="product.thumbnail_image"
  width="600"
  height="750"
  format="webp"
  quality="80"
  loading="lazy"
/>
```

**2. Pagination Strategy:**

- Initial load: 12 products
- Infinite scroll with intersection observer
- Pre-fetch next page when user scrolls 80% down

**3. Caching:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    "/catalog/**": { swr: 3600 }, // Cache for 1 hour
    "/product/**": { swr: 7200 }, // Cache for 2 hours
  },
});
```

### State Management

**Use Pinia for shared state:**

```typescript
// stores/catalog.ts
export const useCatalogStore = defineStore("catalog", {
  state: () => ({
    currentFilters: {},
    selectedCategory: null,
    products: [],
  }),
  actions: {
    setFilters(filters) {
      this.currentFilters = filters;
    },
  },
});
```

### Error Handling

**404 Page for Invalid Products:**

```vue
<!-- pages/product/[id].vue -->
<script setup lang="ts">
const route = useRoute();
const { data: product, error } = await useAsyncData(`product-${route.params.id}`, () =>
  getProductById(route.params.id),
);

if (error.value || !product.value) {
  throw createError({
    statusCode: 404,
    message: "Product not found",
  });
}
</script>
```

---

## 🚨 Risks & Mitigations

### Risk 1: Breaking Existing Workflows

**Impact:** High  
**Mitigation:**

- Keep old modal components in a `_deprecated/` folder initially
- Feature flag to toggle between old/new navigation
- Gradual rollout (10% → 50% → 100% traffic)

### Risk 2: SEO Drop During Transition

**Impact:** Medium  
**Mitigation:**

- Implement 301 redirects if any old URLs exist
- Submit new sitemap to Google Search Console
- Monitor rankings weekly

### Risk 3: Performance Regression

**Impact:** Medium  
**Mitigation:**

- Lighthouse CI in GitHub Actions
- Performance budget alerts
- CDN caching for product images

### Risk 4: User Confusion

**Impact:** Low  
**Mitigation:**

- Add onboarding tooltips for first-time visitors
- Monitor heatmaps (Hotjar/Clarity)
- Collect user feedback

---

## 📚 References & Resources

**Nuxt Documentation:**

- [Dynamic Routes](https://nuxt.com/docs/guide/directory-structure/pages#dynamic-routes)
- [useHead & SEO](https://nuxt.com/docs/getting-started/seo-meta)
- [Server Routes](https://nuxt.com/docs/guide/directory-structure/server)

**Best Practices:**

- [Google E-commerce SEO Guidelines](https://developers.google.com/search/docs/advanced/ecommerce/overview)
- [Web Vitals](https://web.dev/vitals/)
- [Nuxt Image Optimization](https://image.nuxt.com/)

**Inspiration (Competitor Analysis):**

- Tiffany & Co: Full page catalog with filters
- Cartier: Dedicated product pages with galleries
- Tanishq: Hybrid approach with quick view

---

## 📞 Support & Contacts

**Technical Lead:** [Your Name]  
**Migration Branch:** `feature/strategy-a-migration`  
**Documentation:** This file + inline code comments  
**Questions:** Open GitHub issue with tag `[Migration-Strategy-A]`

---

## ✅ Approval & Sign-off

- [ ] Technical Feasibility Review: ****\_\_\_****
- [ ] UX/UI Design Approval: ****\_\_\_****
- [ ] Database Migration Approved: ****\_\_\_****
- [ ] Stakeholder Sign-off: ****\_\_\_****
- [ ] Ready to Start Phase 1: ****\_\_\_****

---

**Document End**  
_Last Updated: February 1, 2026_  
_Version: 1.0_  
_Status: Awaiting Approval_
