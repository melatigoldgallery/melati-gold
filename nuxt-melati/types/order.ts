import type { ApiResponse, PaginationMeta } from "./catalog";

// ============================================================
// INVENTORI
// ============================================================

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_label?: string;
  current_stock: number;
  stock_booked: number;
  min_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  /** Joined dari catalog_products */
  product?: {
    id: string;
    title: string;
    slug?: string;
    thumbnail_image?: string;
    karat?: string;
    weight_grams?: number;
  };
}

export type StockChangeType = "sale" | "restock" | "adjustment" | "return" | "booking" | "unbook";

export interface StockLog {
  id: string;
  variant_id: string;
  order_id?: string;
  change_type: StockChangeType;
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  /** Joined */
  variant?: Pick<ProductVariant, "id" | "sku" | "variant_label">;
}

export interface VariantFormData {
  product_id: string;
  sku: string;
  variant_label?: string;
  current_stock: number;
  min_stock_threshold: number;
  is_active: boolean;
}

// ============================================================
// PESANAN
// ============================================================

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled";
export type PaymentMethod = "transfer" | "cod" | "gateway";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_title: string;
  product_sku: string;
  karat_type?: string;
  weight_grams?: number;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
  /** Joined */
  product?: {
    id: string;
    title: string;
    slug?: string;
    thumbnail_image?: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_proof_url?: string;
  shipping_tracking_number?: string;
  shipping_courier?: string;
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  /** Joined */
  items?: OrderItem[];
}

export interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  payment_method: PaymentMethod;
  notes?: string;
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[];
}

export interface OrderFilters {
  status?: OrderStatus | "";
  search?: string;
  page: number;
  limit: number;
}

// ============================================================
// AUDIT LOG
// ============================================================

export interface AuditLog {
  id: string;
  admin_user_id?: string;
  action: string;
  target_table?: string;
  target_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ============================================================
// RE-EXPORT untuk kemudahan import
// ============================================================
export type { ApiResponse, PaginationMeta };
