export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  display_order: number;
  created_at: string;
  /** Joined from catalog_categories */
  category?: Pick<Category, "id" | "name" | "slug">;
}

export interface CustomService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GoldPriceSetting {
  id: string;
  karat_type: string;
  buying_price: number;
  selling_price: number;
  updated_at: string;
  updated_by?: string;
}

export interface KaratConfiguration {
  id: string;
  karat_type: string;
  label: string;
  gold_purity_percent: number;
  maklon_percent: number;
  is_active: boolean;
  tokopedia_link?: string;
  shopee_link?: string;
  whatsapp_number?: string;
  created_at: string;
  updated_at?: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
