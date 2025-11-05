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
      const cacheKey = cache.generateKey('catalog_categories');

      // If cache enabled, try cache first
      if (useCache) {
        return await cache.fetchWithCache(
          cacheKey,
          async () => {
            console.log("[useCatalogManager] Fetching categories from Supabase...");

            const { data, error } = await $supabase
              .from("catalog_categories")
              .select("*")
              .order("display_order", { ascending: true });

            if (error) throw error;

            console.log("[useCatalogManager] Success! Categories count:", data?.length || 0);
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
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // SUBCATEGORIES MANAGEMENT
  // ============================================

  const getSubcategories = async (categoryId?: string) => {
    try {
      let query = $supabase
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
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const createSubcategory = async (subcategoryData: any) => {
    try {
      const { data, error } = await $supabase.from("catalog_subcategories").insert([subcategoryData]).select().single();

      if (error) throw error;
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
      return { success: true };
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // PRODUCTS MANAGEMENT
  // ============================================

  const getProducts = async (filters?: {
    categoryId?: string;
    subcategoryId?: string;
    isFeatured?: boolean;
    isBestSeller?: boolean;
  }) => {
    try {
      let query = $supabase
        .from("catalog_products")
        .select(
          `
          *,
          category:catalog_categories(id, name, slug),
          subcategory:catalog_subcategories(id, name, slug)
        `
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (filters) {
        if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
        if (filters.subcategoryId) query = query.eq("subcategory_id", filters.subcategoryId);
        if (filters.isFeatured !== undefined) query = query.eq("is_featured", filters.isFeatured);
        if (filters.isBestSeller !== undefined) query = query.eq("is_best_seller", filters.isBestSeller);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
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
      const { data, error } = await $supabase.from("catalog_products").insert([productData]).select().single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error creating product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      // Remove joined relations before update (they are not actual columns)
      const { category, subcategory, ...cleanData } = productData;

      const { data, error } = await $supabase.from("catalog_products").update(cleanData).eq("id", id).select().single();

      if (error) throw error;
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
      return { success: true };
    } catch (error) {
      console.error("Error toggling best seller:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // CUSTOM SERVICES MANAGEMENT
  // ============================================

  const getCustomServices = async () => {
    try {
      const { data, error } = await $supabase
        .from("custom_services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching custom services:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const getServiceWithProducts = async (serviceId: string) => {
    try {
      console.log("[getServiceWithProducts] Fetching service ID:", serviceId);

      // Get service details
      const { data: service, error: serviceError } = await $supabase
        .from("custom_services")
        .select("*")
        .eq("id", serviceId)
        .single();

      console.log("[getServiceWithProducts] Service result:", { service, serviceError });

      if (serviceError) throw serviceError;
      if (!service) {
        return { success: false, error: "Service not found", data: null };
      }

      console.log("[getServiceWithProducts] Service example_products:", service.example_products);
      console.log("[getServiceWithProducts] Array length:", service.example_products?.length);

      // Get example products if available
      let products: any[] = [];
      if (service.example_products && service.example_products.length > 0) {
        console.log("[getServiceWithProducts] Fetching products with IDs:", service.example_products);

        const { data: productsData, error: productsError } = await $supabase
          .from("catalog_products")
          .select(
            "id, title, name, description, thumbnail_image, price, price_display, stock_status, category_id, subcategory_id, weight, karat"
          )
          .in("id", service.example_products)
          .eq("is_active", true);

        console.log("[getServiceWithProducts] Products query result:", { productsData, productsError });

        if (productsError) {
          console.error("[getServiceWithProducts] Error fetching service products:", productsError);
        } else {
          products = productsData || [];
          console.log("[getServiceWithProducts] Products found:", products.length);
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

      console.log("[getServiceWithProducts] Final result:", result);
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
      return { success: true };
    } catch (error) {
      console.error("Error deleting service:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // BEST SELLERS - menggunakan view
  // ============================================

  const getBestSellers = async (limit?: number) => {
    try {
      let query = $supabase.from("v_best_sellers").select("*");

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const getFeaturedProducts = async (limit?: number) => {
    try {
      let query = $supabase.from("v_featured_products").select("*");

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data: data || [] };
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
  };
};
