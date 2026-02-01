# Testing Guide - Strategy A Migration

## 🧪 Comprehensive Testing Checklist

---

## ⚠️ BEFORE TESTING

### Prerequisites

- [ ] Database migration completed (`migration_add_slug_fields.sql`)
- [ ] All slugs generated for categories
- [ ] WhatsApp number configured
- [ ] Dev server running (`npm run dev`)
- [ ] Browser console open (F12)

---

## 1️⃣ Homepage Testing

### Visual Check

- [ ] Hero section displays correctly
- [ ] CatalogShowcase carousel shows all active categories
- [ ] Category images load properly
- [ ] Carousel navigation arrows work
- [ ] Keyboard navigation works (arrow keys)
- [ ] Mobile: carousel is swipeable

### Functionality

- [ ] Click category card → navigates to `/catalog/[slug]`
- [ ] URL changes correctly
- [ ] No console errors
- [ ] Back button returns to homepage

### Performance

- [ ] Page loads in < 2 seconds
- [ ] Images lazy load below fold
- [ ] Lighthouse score > 85

---

## 2️⃣ Catalog Page Testing

### URL Routing

- [ ] Direct URL access works: `/catalog/cincin`
- [ ] Direct URL with filters works: `/catalog/cincin?subcategory=tunangan`
- [ ] Invalid category shows 404 error
- [ ] Breadcrumb shows correct path

### Filter Sidebar (Desktop)

- [ ] Filter sidebar visible on left
- [ ] Subcategories load correctly
- [ ] Checking subcategory updates URL
- [ ] Checking subcategory filters products
- [ ] Price range buttons work
- [ ] Karat radio buttons work
- [ ] Sort dropdown updates results
- [ ] "Reset" button clears all filters
- [ ] Active filters show in UI

### Filter Sidebar (Mobile)

- [ ] "Filter" button visible
- [ ] Click opens bottom drawer
- [ ] Drawer has all filter options
- [ ] Applying filter closes drawer
- [ ] URL updates correctly
- [ ] Products refetch with new filters

### Product Grid

- [ ] Products display in grid
- [ ] Desktop: 4 columns
- [ ] Tablet: 3 columns
- [ ] Mobile: 2 columns
- [ ] Hover effect works (desktop)
- [ ] Images load with lazy loading
- [ ] Product count displays correctly
- [ ] Empty state shows when no products

### Navigation

- [ ] Click product → navigates to `/product/[id]`
- [ ] URL changes correctly
- [ ] Browser back returns to catalog with filters intact
- [ ] Browser forward works

### Performance

- [ ] Initial load < 2 seconds
- [ ] Filter application < 500ms
- [ ] Images optimized (check Network tab)
- [ ] No memory leaks (check 10+ filter changes)

---

## 3️⃣ Product Detail Page Testing

### URL Routing

- [ ] Direct URL access works: `/product/abc123`
- [ ] Invalid product ID shows 404
- [ ] Breadcrumb shows full path
- [ ] Breadcrumb links work

### Product Gallery (Left Side)

- [ ] Main image displays correctly
- [ ] Multiple images show navigation arrows
- [ ] Click arrow → changes main image
- [ ] Thumbnail strip shows all images
- [ ] Click thumbnail → updates main image
- [ ] Active thumbnail has border highlight
- [ ] Image counter shows correct number
- [ ] Hover shows zoom hint (desktop)
- [ ] Click main image → opens lightbox

### Lightbox Modal

- [ ] Lightbox opens fullscreen
- [ ] Image displays large
- [ ] Navigation arrows work
- [ ] Keyboard arrows work (←/→)
- [ ] ESC key closes lightbox
- [ ] Click outside closes lightbox
- [ ] Close button works
- [ ] Image counter updates

### Product Info (Right Side)

- [ ] Product name displays
- [ ] Category/subcategory shows
- [ ] Price displays correctly (formatted)
- [ ] Description shows (with line breaks)
- [ ] Specifications table displays
- [ ] Stock status shows (if available)
- [ ] WhatsApp button exists
- [ ] Custom Order button exists
- [ ] Info box displays

### CTA Buttons

- [ ] Click WhatsApp → opens WhatsApp Web/App
- [ ] WhatsApp message pre-filled with product info
- [ ] Click Custom Order → opens WhatsApp with custom message
- [ ] Buttons have hover effects
- [ ] Buttons work on mobile

### Related Products

- [ ] Related products section shows
- [ ] Desktop: Grid layout (3-4 columns)
- [ ] Mobile: Horizontal scroll carousel
- [ ] Shows 4-6 related products
- [ ] Related products from same category/subcategory
- [ ] Click related product → navigates to that product
- [ ] URL updates correctly

### Performance

- [ ] Page loads in < 2 seconds
- [ ] Images load progressively
- [ ] Gallery smooth (60fps)
- [ ] No layout shift (CLS < 0.1)

---

## 4️⃣ SEO & Social Sharing

### Meta Tags (View Page Source)

- [ ] `<title>` tag present and descriptive
- [ ] Meta description present
- [ ] Open Graph title (`og:title`)
- [ ] Open Graph description (`og:description`)
- [ ] Open Graph image (`og:image`)
- [ ] Open Graph type (`og:type`)
- [ ] Canonical URL (`rel="canonical"`)
- [ ] Product: price meta tag (`product:price:amount`)

### Social Sharing Test

- [ ] Copy product URL
- [ ] Paste in WhatsApp → preview shows
- [ ] Preview has image
- [ ] Preview has title & description
- [ ] Click preview → opens correct page
- [ ] Test on Facebook (use Facebook Debugger)
- [ ] Test on Twitter (use Twitter Card Validator)

### Search Engine

- [ ] Run: `site:melatigoldshop.com` in Google
- [ ] Verify pages get indexed (after deployment)
- [ ] Check Google Search Console
- [ ] Submit sitemap.xml

---

## 5️⃣ Browser Navigation Testing

### Forward/Back Behavior

Test flow: Home → Catalog → Product → Back → Back → Forward → Forward

- [ ] Start at homepage `/`
- [ ] Click category → goes to `/catalog/cincin`
- [ ] Click product → goes to `/product/abc123`
- [ ] Click browser BACK → returns to `/catalog/cincin`
- [ ] Products still loaded (no refetch)
- [ ] Filters still applied
- [ ] Click browser BACK → returns to `/`
- [ ] Click browser FORWARD → goes to `/catalog/cincin`
- [ ] Click browser FORWARD → goes to `/product/abc123`
- [ ] No console errors during navigation

### Bookmark Test

- [ ] Go to product page
- [ ] Bookmark page (Ctrl+D)
- [ ] Close browser
- [ ] Open bookmark
- [ ] Page loads correctly

### Direct URL Test

- [ ] Open new incognito tab
- [ ] Type: `localhost:3000/catalog/cincin`
- [ ] Page loads correctly
- [ ] Type: `localhost:3000/product/abc123`
- [ ] Page loads correctly

---

## 6️⃣ Mobile Responsive Testing

### Viewport Sizes to Test

- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] Samsung Galaxy (412px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)

### Homepage Mobile

- [ ] Carousel works with touch swipe
- [ ] Images don't overflow
- [ ] Text readable
- [ ] Buttons touchable (min 44px)

### Catalog Mobile

- [ ] Filter button visible and large
- [ ] Filter drawer opens from bottom
- [ ] Drawer scrollable if content long
- [ ] Product grid 2 columns
- [ ] Products not too small
- [ ] Touch targets adequate

### Product Mobile

- [ ] Gallery swipeable
- [ ] Info section scrollable
- [ ] Buttons full width
- [ ] Text not cut off
- [ ] Related products scroll horizontally
- [ ] Lightbox works on mobile

---

## 7️⃣ Edge Cases & Error Handling

### Missing Data

- [ ] Category with no products → shows empty state
- [ ] Product with no images → shows placeholder
- [ ] Product with no price → shows "Contact Us"
- [ ] Product with missing description → hides section
- [ ] No related products → hides section

### Invalid URLs

- [ ] `/catalog/nonexistent` → shows 404
- [ ] `/product/invalid-id` → shows 404
- [ ] `/catalog/` (no slug) → shows error/redirect
- [ ] 404 page has link to homepage

### Network Issues

- [ ] Slow connection (throttle to 3G)
- [ ] Loading states display
- [ ] Timeout handled gracefully
- [ ] Error message shows
- [ ] Retry mechanism works

### Concurrent Actions

- [ ] Apply multiple filters quickly
- [ ] Click products rapidly
- [ ] No race conditions
- [ ] No duplicate API calls

---

## 8️⃣ Performance Testing

### Lighthouse Audit

```bash
# Run in production mode
npm run build
npm run preview

# Open Chrome DevTools
# Lighthouse tab
# Run audit (Desktop & Mobile)
```

**Target Scores:**

- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 95
- [ ] SEO: > 95

### Network Analysis

- [ ] Total page size < 1MB (catalog)
- [ ] Total page size < 2MB (product with images)
- [ ] Number of requests < 50
- [ ] Images use WebP format
- [ ] Images lazy loaded
- [ ] No unnecessary requests

### Loading Time

- [ ] Homepage: < 1.5s
- [ ] Catalog page: < 2s
- [ ] Product page: < 2.5s
- [ ] Filter change: < 500ms
- [ ] Product click: < 1s transition

---

## 9️⃣ Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Focus indicator visible
- [ ] Skip to content link (optional)
- [ ] Modal traps focus
- [ ] ESC closes modal
- [ ] Enter activates buttons

### Screen Reader

- [ ] Install NVDA (Windows) or VoiceOver (Mac)
- [ ] Turn on screen reader
- [ ] Navigate through page
- [ ] All images have alt text
- [ ] All buttons have labels
- [ ] Form inputs have labels
- [ ] Landmarks present (header, main, footer)

### Color Contrast

- [ ] Text readable on backgrounds
- [ ] Buttons have good contrast
- [ ] Use Chrome DevTools accessibility panel
- [ ] Check WCAG AA compliance

---

## 🔟 Security Testing

### XSS Prevention

- [ ] Product names with HTML don't render
- [ ] Descriptions sanitized
- [ ] URLs validated

### Data Validation

- [ ] Invalid product ID handled
- [ ] Invalid filter values ignored
- [ ] SQL injection not possible (using Supabase)

---

## 1️⃣1️⃣ Cross-Browser Testing

### Browsers to Test

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Features to Verify

- [ ] CSS Grid layout works
- [ ] Flexbox works
- [ ] Modern JS features work
- [ ] Images load correctly
- [ ] Navigation works
- [ ] No console errors

---

## 1️⃣2️⃣ Integration Testing

### Full User Journey

```
Scenario: User wants to buy a 22K gold ring

1. [ ] Open homepage
2. [ ] See "Cincin" category in carousel
3. [ ] Click "Cincin" category
4. [ ] Arrives at /catalog/cincin
5. [ ] See filter sidebar
6. [ ] Check "Cincin Tunangan" subcategory
7. [ ] URL updates to ?subcategory=tunangan
8. [ ] Products filter to show only that subcategory
9. [ ] Select "22K" karat filter
10. [ ] Products further filtered
11. [ ] Click on a product
12. [ ] Arrives at /product/[id]
13. [ ] See product images
14. [ ] Read description
15. [ ] Click WhatsApp button
16. [ ] WhatsApp opens with pre-filled message
17. [ ] Message contains product name and ID
```

---

## 📋 Test Report Template

```markdown
## Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]
**Browser:** [Chrome 120 / Firefox 121 / etc]
**Device:** [Desktop / iPhone 12 / etc]

### Test Results

#### Homepage

- ✅ Pass: All tests passed
- ⚠️ Warning: Minor issue found (non-blocking)
- ❌ Fail: Critical issue found

#### Catalog Page

- Status: [Pass/Fail]
- Issues: [List any issues]

#### Product Page

- Status: [Pass/Fail]
- Issues: [List any issues]

### Issues Found

1. **Issue Title**
   - Severity: High/Medium/Low
   - Description: [Description]
   - Steps to reproduce:
     1. Step 1
     2. Step 2
   - Expected: [What should happen]
   - Actual: [What actually happens]
   - Screenshot: [If applicable]

### Performance Metrics

- Lighthouse Performance: 92/100
- Page Load Time: 1.8s
- Total Page Size: 850KB

### Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

### Sign-off

- [ ] All critical issues resolved
- [ ] Ready for deployment
```

---

## 🚀 Pre-Deployment Checklist

Before going live:

- [ ] All tests passed (no critical issues)
- [ ] Performance metrics acceptable
- [ ] SEO verified
- [ ] Mobile tested
- [ ] Cross-browser tested
- [ ] Error handling verified
- [ ] Analytics configured
- [ ] Monitoring set up
- [ ] Backup taken
- [ ] Rollback plan ready

---

**Testing completed? Deploy with confidence! 🎉**
