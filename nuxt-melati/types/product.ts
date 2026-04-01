export interface Product {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  category_id: string;
  subcategory_id?: string;
  karat_type?: string;
  weight_grams?: number;
  price?: number;
  price_override?: number;
  images: string[];
  video_url?: string;
  is_featured: boolean;
  is_best_seller: boolean;
  display_order: number;
  size?: string;
  specs?: ProductSpec[];
  /** Custom Tokopedia link (supervisor only) */
  custom_tokopedia_link?: string;
  /** Custom Shopee link (supervisor only) */
  custom_shopee_link?: string;
  /** Custom WhatsApp number (supervisor only) */
  custom_whatsapp_number?: string;
  created_at: string;
  updated_at?: string;
  /** Joined from catalog_categories */
  category_name?: string;
  /** Joined from catalog_subcategories */
  subcategory_name?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductFilters {
  categoryId?: string;
  subcategoryId?: string;
  karat?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  limit?: number;
  useCache?: boolean;
}
