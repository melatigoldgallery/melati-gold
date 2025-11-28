// Composable untuk manage catalog (Categories, Subcategories, Products, Custom Services)
export const useCatalogManager = () => {
  const { $supabase } = useNuxtApp();
  const cache = useCacheManager();

  if (!$supabase) {
    throw new Error("Supabase client is not available");
  }

  // Helper function to get error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error);
  };

  // ============================================
  // CATEGORIES MANAGEMENT (with caching)
  // ============================================

  const getCategories = async (useCache = true) => {
    try {
      const cacheKey = cache.generateKey("catalog_categories");

      // If cache enabled, try cache first
      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            const { data, error } = await $supabase
              .from("catalog_categories")
              .select("*")
              .order("display_order", { ascending: true });

            if (error) throw error;
            return { success: true, data: data || [] };
          },
          { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
        );
      }

      // No cache, fetch directly
      const { data, error } = await $supabase
        .from("catalog_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("[useCatalogManager] Error fetching categories:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const createCategory = async (categoryData: any) => {
    try {
      const { data, error } = await $supabase.from("catalog_categories").insert([categoryData]).select().single();

      if (error) throw error;

      // Invalidate categories cache after create
      cache.clearPrefix("catalog_categories");

      return { success: true, data };
    } catch (error) {
      console.error("Error creating category:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateCategory = async (id: string, categoryData: any) => {
    try {
      // Remove any non-column fields before update
      const { ...cleanData } = categoryData;

      const { data, error } = await $supabase
        .from("catalog_categories")
        .update(cleanData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate categories cache after update
      cache.clearPrefix("catalog_categories");

      return { success: true, data };
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await $supabase.from("catalog_categories").delete().eq("id", id);

      if (error) throw error;

      // Invalidate categories cache after delete
      cache.clearPrefix("catalog_categories");

      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // SUBCATEGORIES MANAGEMENT (Optimized with caching)
  // ============================================

  const getSubcategories = async (categoryId?: string, useCache = true) => {
    try {
      const cacheKey = cache.generateKey("catalog_subcategories", { categoryId });

      // Cache strategy
      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            return await fetchSubcategoriesFromDB();
          },
          { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
        );
      }

      return await fetchSubcategoriesFromDB();

      async function fetchSubcategoriesFromDB() {
        let query = $supabase!
          .from("catalog_subcategories")
          .select(
            `
            *,
            category:catalog_categories(id, name, slug)
          `
          )
          .order("display_order", { ascending: true });

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: data || [] };
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const createSubcategory = async (subcategoryData: any) => {
    try {
      const { data, error } = await $supabase.from("catalog_subcategories").insert([subcategoryData]).select().single();

      if (error) throw error;

      // Invalidate subcategories cache after create
      cache.clearPrefix("catalog_subcategories");

      return { success: true, data };
    } catch (error) {
      console.error("Error creating subcategory:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateSubcategory = async (id: string, subcategoryData: any) => {
    try {
      // Remove joined relations before update (category is a join, not a column)
      const { category, ...cleanData } = subcategoryData;

      const { data, error } = await $supabase
        .from("catalog_subcategories")
        .update(cleanData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate subcategories cache after update
      cache.clearPrefix("catalog_subcategories");
      console.log("[useCatalogManager] Cache invalidated after updating subcategory");

      return { success: true, data };
    } catch (error) {
      console.error("Error updating subcategory:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      const { error } = await $supabase.from("catalog_subcategories").delete().eq("id", id);

      if (error) throw error;

      // Invalidate subcategories cache after delete
      cache.clearPrefix("catalog_subcategories");

      return { success: true };
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // PRODUCTS MANAGEMENT (Optimized with pagination & caching)
  // ============================================

  const getProducts = async (filters?: {
    categoryId?: string;
    subcategoryId?: string;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    page?: number;
    limit?: number;
    useCache?: boolean;
    selectAll?: boolean; // For admin - need all columns
  }) => {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50; // Default 50 items per page
      const useCache = filters?.useCache !== false; // Default true
      const selectAll = filters?.selectAll || false;

      // Calculate pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Generate cache key based on filters
      const cacheKey = cache.generateKey("catalog_products", {
        categoryId: filters?.categoryId,
        subcategoryId: filters?.subcategoryId,
        isFeatured: filters?.isFeatured,
        isBestSeller: filters?.isBestSeller,
        page,
        limit,
        selectAll,
      });

      // Cache strategy
      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            return await fetchProductsFromDB();
          },
          { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
        );
      }

      return await fetchProductsFromDB();

      // Fetch function
      async function fetchProductsFromDB() {
        // Select specific columns for list view (save ~60% bandwidth)
        const selectColumns = selectAll
          ? `
            *,
            category:catalog_categories(id, name, slug),
            subcategory:catalog_subcategories(id, name, slug)
          `
          : `
            id,
            title,
            thumbnail_image,
            price,
            price_display,
            karat,
            weight,
            is_featured,
            is_best_seller,
            is_active,
            stock_status,
            display_order,
            category_id,
            subcategory_id,
            category:catalog_categories(id, name, slug),
            subcategory:catalog_subcategories(id, name, slug)
          `;

        let query = $supabase!
          .from("catalog_products")
          .select(selectColumns, { count: "exact" })
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .range(from, to);

        if (filters) {
          if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
          if (filters.subcategoryId) query = query.eq("subcategory_id", filters.subcategoryId);
          if (filters.isFeatured !== undefined) query = query.eq("is_featured", filters.isFeatured);
          if (filters.isBestSeller !== undefined) query = query.eq("is_best_seller", filters.isBestSeller);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          success: true,
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
            hasMore: (count || 0) > to + 1,
          },
        };
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: getErrorMessage(error),
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0, hasMore: false },
      };
    }
  };

  const getProductById = async (id: string) => {
    try {
      const { data, error } = await $supabase
        .from("catalog_products")
        .select(
          `
          *,
          category:catalog_categories(id, name, slug),
          subcategory:catalog_subcategories(id, name, slug)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const createProduct = async (productData: any) => {
    try {
      // Remove joined relations and read-only fields
      const {
        category,
        subcategory,
        id, // Auto-generated
        created_at, // Auto-set
        updated_at, // Auto-managed by trigger
        view_count, // Should not be set on create
        ...cleanData
      } = productData;

      const { data, error } = await $supabase.from("catalog_products").insert([cleanData]).select().single();

      if (error) throw error;

      // Invalidate products cache after create
      cache.clearPrefix("catalog_products");
      cache.clearPrefix("v_featured_products");
      cache.clearPrefix("v_best_sellers");

      return { success: true, data };
    } catch (error) {
      console.error("Error creating product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      // Remove joined relations and read-only fields
      const {
        category,
        subcategory,
        id: _id, // Primary key - don't update
        created_at, // Read-only
        updated_at, // Auto-managed by trigger
        view_count, // Should not be updated manually
        ...cleanData
      } = productData;

      const { data, error } = await $supabase.from("catalog_products").update(cleanData).eq("id", id).select().single();

      if (error) throw error;

      // Invalidate products cache after update
      cache.clearPrefix("catalog_products");
      cache.clearPrefix("v_featured_products");
      cache.clearPrefix("v_best_sellers");

      return { success: true, data };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await $supabase.from("catalog_products").delete().eq("id", id);

      if (error) throw error;

      // Invalidate products cache after delete
      cache.clearPrefix("catalog_products");
      cache.clearPrefix("v_featured_products");
      cache.clearPrefix("v_best_sellers");

      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const toggleProductFeatured = async (id: string) => {
    try {
      const { data, error } = await $supabase.rpc("toggle_featured", {
        p_product_id: id,
      });

      if (error) throw error;

      // Invalidate products and featured cache after toggle
      cache.clearPrefix("catalog_products");
      cache.clearPrefix("v_featured_products");

      return { success: true };
    } catch (error) {
      console.error("Error toggling featured:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const toggleProductBestSeller = async (id: string) => {
    try {
      const { data, error } = await $supabase.rpc("toggle_best_seller", {
        p_product_id: id,
      });

      if (error) throw error;

      // Invalidate products and best sellers cache after toggle
      cache.clearPrefix("catalog_products");
      cache.clearPrefix("v_best_sellers");

      return { success: true };
    } catch (error) {
      console.error("Error toggling best seller:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // CUSTOM SERVICES MANAGEMENT (Optimized with caching)
  // ============================================

  const getCustomServices = async (useCache = true) => {
    try {
      const cacheKey = cache.generateKey("custom_services");

      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            return await fetchServicesFromDB();
          },
          { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
        );
      }

      return await fetchServicesFromDB();

      async function fetchServicesFromDB() {
        const { data, error } = await $supabase!
          .from("custom_services")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        return { success: true, data: data || [] };
      }
    } catch (error) {
      console.error("Error fetching custom services:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const getServiceWithProducts = async (serviceId: string) => {
    try {
      // Get service details
      const { data: service, error: serviceError } = await $supabase
        .from("custom_services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;
      if (!service) {
        return { success: false, error: "Service not found", data: null };
      }

      // Get example products if available
      let products: any[] = [];
      if (service.example_products && service.example_products.length > 0) {
        const { data: productsData, error: productsError } = await $supabase
          .from("catalog_products")
          .select(
            "id, title, name, description, thumbnail_image, price, price_display, stock_status, category_id, subcategory_id, weight, karat"
          )
          .in("id", service.example_products)
          .eq("is_active", true);

        if (productsError) {
          console.error("[getServiceWithProducts] Error fetching service products:", productsError);
        } else {
          products = productsData || [];
        }
      } else {
        console.log("[getServiceWithProducts] No example_products to fetch");
      }

      const result = {
        success: true,
        data: {
          ...service,
          products,
        },
      };

      return result;
    } catch (error) {
      console.error("[getServiceWithProducts] Error:", error);
      return { success: false, error: getErrorMessage(error), data: null };
    }
  };

  const createCustomService = async (serviceData: any) => {
    try {
      const { data, error } = await $supabase.from("custom_services").insert([serviceData]).select().single();

      if (error) throw error;

      // Invalidate custom services cache after create
      cache.clearPrefix("custom_services");

      return { success: true, data };
    } catch (error) {
      console.error("Error creating service:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateCustomService = async (id: string, serviceData: any) => {
    try {
      // Remove any non-column fields before update
      const { ...cleanData } = serviceData;

      const { data, error } = await $supabase.from("custom_services").update(cleanData).eq("id", id).select().single();

      if (error) throw error;

      // Invalidate custom services cache after update
      cache.clearPrefix("custom_services");

      return { success: true, data };
    } catch (error) {
      console.error("Error updating service:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const deleteCustomService = async (id: string) => {
    try {
      const { error } = await $supabase.from("custom_services").delete().eq("id", id);

      if (error) throw error;

      // Invalidate custom services cache after delete
      cache.clearPrefix("custom_services");
      console.log("[useCatalogManager] Cache invalidated after deleting custom service");

      return { success: true };
    } catch (error) {
      console.error("Error deleting service:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // BEST SELLERS & FEATURED - Optimized with caching
  // ============================================

  const getBestSellers = async (limit?: number, useCache = true) => {
    try {
      const cacheKey = cache.generateKey("v_best_sellers", { limit });

      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            return await fetchBestSellersFromDB();
          },
          { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
        );
      }

      return await fetchBestSellersFromDB();

      async function fetchBestSellersFromDB() {
        let query = $supabase!.from("v_best_sellers").select("*");

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: data || [] };
      }
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const getFeaturedProducts = async (limit?: number, useCache = true) => {
    try {
      const cacheKey = cache.generateKey("v_featured_products", { limit });

      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            return await fetchFeaturedFromDB();
          },
          { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
        );
      }

      return await fetchFeaturedFromDB();

      async function fetchFeaturedFromDB() {
        let query = $supabase!.from("v_featured_products").select("*");

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: data || [] };
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  // ============================================
  // BULK OPERATIONS
  // ============================================

  const bulkUpdateDisplayOrder = async (table: string, items: Array<{ id: string; display_order: number }>) => {
    try {
      const promises = items.map((item) =>
        $supabase.from(table).update({ display_order: item.display_order }).eq("id", item.id)
      );

      await Promise.all(promises);

      // Invalidate cache based on table
      if (table === "catalog_categories") {
        cache.clearPrefix("catalog_categories");
      } else if (table === "catalog_subcategories") {
        cache.clearPrefix("catalog_subcategories");
      } else if (table === "catalog_products") {
        cache.clearPrefix("catalog_products");
        cache.clearPrefix("v_featured_products");
        cache.clearPrefix("v_best_sellers");
      } else if (table === "custom_services") {
        cache.clearPrefix("custom_services");
      }

      return { success: true };
    } catch (error) {
      console.error("Error bulk updating display order:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  return {
    // Categories
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Subcategories
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,

    // Products
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductFeatured,
    toggleProductBestSeller,

    // Custom Services
    getCustomServices,
    createCustomService,
    updateCustomService,
    deleteCustomService,
    getServiceWithProducts,

    // Views
    getBestSellers,
    getFeaturedProducts,

    // Bulk Operations
    bulkUpdateDisplayOrder,
  } as const;
};
