/** Nama tabel Supabase */
export const TABLES = {
  ADMIN_USERS: "admin_users",
  CATEGORIES: "catalog_categories",
  SUBCATEGORIES: "catalog_subcategories",
  PRODUCTS: "catalog_products",
  CUSTOM_SERVICES: "custom_services",
  BEST_SELLER_ANALYTICS: "best_seller_analytics",
  GOLD_PRICE_SETTINGS: "gold_price_settings",
  GOLD_PRICE_HISTORY: "gold_price_history",
  KARAT_CONFIGURATIONS: "karat_configurations",
  // Inventori & Pesanan
  PRODUCT_VARIANTS: "product_variants",
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  STOCK_LOGS: "stock_logs",
  AUDIT_LOGS: "admin_audit_logs",
} as const;

/** Nama view Supabase */
export const VIEWS = {
  BEST_SELLERS: "v_best_sellers",
  FEATURED_PRODUCTS: "v_featured_products",
  PRODUCTS_WITH_PRICE: "vw_products_with_calculated_price",
  CATALOG_PRODUCTS_FULL: "v_catalog_products_full",
} as const;

/** Nama cache prefix per domain */
export const CACHE_KEYS = {
  CATEGORIES: "categories",
  SUBCATEGORIES: "subcategories",
  PRODUCTS: "products",
  SERVICES: "services",
  GOLD_PRICES: "gold-prices",
  KARAT_CONFIGS: "karat-configs",
} as const;
