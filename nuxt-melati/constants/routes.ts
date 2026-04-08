export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CATALOG: (category: string) => `/catalog/${category}`,
  PRODUCT: (id: string) => `/product/${id}`,
  SERVICE: (id: string) => `/service/${id}`,
  ADMIN: {
    CATALOG: "/admin/catalog",
    USERS: "/admin/users",
    ORDERS: "/admin/orders",
    ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
    INVENTORY: "/admin/inventory",
  },
} as const;
