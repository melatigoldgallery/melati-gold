# Setup Guide untuk Melati Gold Admin System

## ✅ Prerequisites yang Sudah Tersedia

Sistem sudah dilengkapi dengan:

- ✅ Supabase client plugin (`plugins/supabase.client.ts`)
- ✅ Content management composable (`composables/useContentManager.ts`)
- ✅ Cloudinary integration (`composables/useCloudinary.ts`)
- ✅ Database utilities (`composables/useDatabase.ts`)
- ✅ Admin panel UI (`pages/admin/`)
- ✅ Setup testing page (`pages/admin/setup.vue`)

## 1. Install Dependencies ✅ DONE

Dependencies sudah terinstall:

```bash
npm install @supabase/supabase-js cloudinary
```

## 2. Setup Environment Variables

### A. Copy template environment file

```bash
cp .env.example .env
```

### B. Update .env dengan credentials Anda

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloudinary Configuration
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NUXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=melati_gold_unsigned
```

## 2. Setup Supabase

### A. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Note down your Project URL and anon key

### B. Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key varchar(50) NOT NULL,
  item_key varchar(100) NOT NULL,
  title varchar(255),
  description text,
  image_url text,
  price integer,
  metadata jsonb,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(section_key, item_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_sections_key ON content_sections(section_key, is_active);
CREATE INDEX IF NOT EXISTS idx_content_sections_order ON content_sections(section_key, display_order);

-- Insert sample data
INSERT INTO content_sections (section_key, item_key, title, description, image_url, price, metadata, display_order, is_active) VALUES
('products', 'featured_1', 'Cincin Berlian', 'Cincin berlian elegan dengan potongan modern, cocok untuk momen spesial.', '/img/ring.jpg', 4500000, '{"karat": "17K", "weight": "2.8 gr", "images": ["/img/ring.jpg", "/img/ring2.jpg"]}', 1, true),
('products', 'featured_2', 'Anting Elegan', 'Anting emas berkilau dengan desain timeless untuk tampilan anggun.', '/img/earrings1.jpg', 2800000, '{"karat": "16K", "weight": "2.1 gr", "images": ["/img/earrings1.jpg"]}', 2, true),
('products', 'featured_3', 'Kalung Mewah', 'Kalung emas mewah dengan detail halus yang menonjolkan pesona.', '/img/necklace.jpg', 5200000, '{"karat": "17K", "weight": "5.4 gr", "images": ["/img/necklace.jpg"]}', 3, true);
```

## 3. Setup Cloudinary

### A. Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Note down Cloud Name, API Key, and API Secret

### B. Create Upload Preset

1. Go to Settings > Upload in Cloudinary dashboard
2. Click "Add upload preset"
3. Set name: `melati_gold_unsigned`
4. Set Signing Mode: `Unsigned`
5. Set Folder: `melati-gold`

## 4. Environment Variables

Create/update `.env` file:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 5. Update Nuxt Config

Add to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase"],

  runtimeConfig: {
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryUploadPreset: "melati_gold_unsigned",
    },
  },

  supabase: {
    redirectOptions: {
      login: "/admin",
      callback: "/admin",
      exclude: ["/", "/admin"], // Don't redirect these routes
    },
  },
});
```

## 6. Testing & Verification

### A. Test Database Connection

1. Start development server: `npm run dev`
2. Visit `/admin/setup` untuk test koneksi dan setup database
3. Klik "Test Connection" untuk verify Supabase
4. Klik "Initialize Sample Data" untuk create sample content

### B. Test Admin Panel

1. Visit `/admin` untuk access admin panel
2. Test CRUD operations pada products, services, about
3. Test image upload ke Cloudinary

### C. Test Frontend Integration

1. Setelah database ready, update `components/FeaturedProducts.vue`:

   ```vue
   <script setup lang="ts">
   // Uncomment ini setelah database setup
   const { getContent, loadContent } = useContentManager();
   const products = getContent("products");

   onMounted(() => {
     loadContent("products");
   });

   // Comment hardcoded products data
   // const products = ref([...])
   </script>
   ```

## 7. File Structure yang Sudah Tersedia

```
nuxt-melati/
├── .env.example              # Template environment variables
├── SETUP_GUIDE.md           # Setup instructions
├── composables/
│   ├── useContentManager.ts # Universal content CRUD
│   ├── useCloudinary.ts     # Image upload/management
│   └── useDatabase.ts       # Database utilities
├── pages/admin/
│   ├── index.vue           # Main admin panel
│   └── setup.vue           # Database setup/testing
├── components/admin/
│   ├── ProductList.vue     # Product management
│   ├── ServiceList.vue     # Service management
│   ├── AboutList.vue       # About content management
│   └── EditModal.vue       # Universal edit modal
├── plugins/
│   └── supabase.client.ts  # Supabase integration
├── server/api/cloudinary/
│   ├── delete.post.ts      # Delete images
│   └── usage.get.ts        # Get usage stats
└── database/
    └── schema.sql          # Database schema
```

## Troubleshooting

### If Supabase not working:

- Check environment variables
- Verify database connection
- Check RLS policies in Supabase

### If Cloudinary not working:

- Verify API credentials
- Check upload preset settings
- Ensure unsigned uploads enabled

### If components not loading:

- Check console for errors
- Verify composable imports
- Ensure dependencies installed
