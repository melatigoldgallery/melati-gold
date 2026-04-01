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
  },
} as const;
