// Composable untuk manage catalog (Categories, Subcategories, Products, Custom Services)
export const useCatalogManager = () => {
  const { $supabase } = useNuxtApp();
  const cache = useCacheManager();
  // Harus dipanggil di top-level (synchronous context) agar useRuntimeConfig bekerja
  const { deleteFileByUrl } = useCloudinary();

  if (!$supabase) {
    throw new Error("Supabase client is not available");
  }

  // Helper function to get error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error);
  };

  /**
   * Generate URL-friendly slug dari nama produk.
   * Contoh: "Cincin Emas 18K & Berlian" → "cincin-emas-18k-berlian"
   */
  const generateProductSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // hapus karakter special
      .trim()
      .replace(/\s+/g, "-") // spasi → hyphen
      .replace(/-+/g, "-"); // hapus double-hyphen
  };

  /**
   * Pastikan slug unik. Jika sudah ada, tambah suffix -2, -3, dst.
   */
  const ensureUniqueProductSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 2;
    while (true) {
      let query = $supabase.from("catalog_products").select("id").eq("slug", slug);
      if (excludeId) query = query.neq("id", excludeId);
      const { data } = await query.maybeSingle();
      if (!data) break; // slug tersedia
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
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
          { ttl: 24 * 60 * 60 * 1000 }, // Cache for 24 hours (kategori jarang berubah)
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
          { ttl: 24 * 60 * 60 * 1000 }, // Cache for 24 hours (subkategori jarang berubah)
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
          `,
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
          { ttl: 30 * 60 * 1000 }, // Cache for 30 minutes
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

  /**
   * Fetch produk by slug (SEO-friendly URL).
   * Digunakan di pages/product/[id].vue saat param bukan UUID.
   */
  const getProductBySlug = async (slug: string) => {
    const cacheKey = cache.generateKey("catalog_product_slug", { slug });
    const cached = cache.get<{ success: boolean; data: any }>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await $supabase
        .from("catalog_products")
        .select(
          `*,
          category:catalog_categories(id, name, slug),
          subcategory:catalog_subcategories(id, name, slug)`,
        )
        .eq("slug", slug)
        .single();

      if (error) throw error;

      if (data) {
        const flattenedData = {
          ...data,
          category_id: data.category?.id || data.category_id,
          category_name: data.category?.name || null,
          category_slug: data.category?.slug || null,
          subcategory_id: data.subcategory?.id || data.subcategory_id,
          subcategory_name: data.subcategory?.name || null,
          subcategory_slug: data.subcategory?.slug || null,
        };
        const result = { success: true, data: flattenedData };
        cache.set(cacheKey, result, { ttl: 30 * 60 * 1000 });
        return result;
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const getProductById = async (id: string, retryAttempt: number = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [500, 1000, 2000]; // Faster retries for read operations

    // Cache check — hanya pada attempt pertama, biarkan retry berjalan jika ada error
    const cacheKey = cache.generateKey("catalog_product", { id });
    if (retryAttempt === 0) {
      const cached = cache.get<{ success: boolean; data: any }>(cacheKey);
      if (cached) return cached;
    }

    try {
      // 15-second timeout for read operations (faster than create/update)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("⏱️ Timeout loading product details. Please check your connection and try again.")),
          15000,
        ),
      );

      const fetchPromise = $supabase
        .from("catalog_products")
        .select(
          `
          *,
          category:catalog_categories(id, name, slug),
          subcategory:catalog_subcategories(id, name, slug)
        `,
        )
        .eq("id", id)
        .single();

      const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as Awaited<typeof fetchPromise>;

      if (error) {
        console.error("[getProductById] ❌ Supabase error:", {
          code: error.code,
          message: error.message,
          retryable: isRetryableError(error),
        });

        // ✅ RETRY LOGIC: If error is transient and retries remaining
        if (isRetryableError(error) && retryAttempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryAttempt];
          console.warn(
            `[getProductById] 🔄 Retrying (${retryAttempt + 1}/${MAX_RETRIES}) after ${delay}ms due to: ${error.message}`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return getProductById(id, retryAttempt + 1);
        }

        throw error;
      }

      // Flatten nested category and subcategory data for easier access
      if (data) {
        const flattenedData = {
          ...data,
          category_id: data.category?.id || data.category_id,
          category_name: data.category?.name || null,
          category_slug: data.category?.slug || null,
          subcategory_id: data.subcategory?.id || data.subcategory_id,
          subcategory_name: data.subcategory?.name || null,
          subcategory_slug: data.subcategory?.slug || null,
        };
        const result = { success: true, data: flattenedData };
        // Simpan ke cache setelah fetch sukses (30 menit)
        cache.set(cacheKey, result, { ttl: 30 * 60 * 1000 });
        return result;
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // Helper: Check if error is retryable (transient failures)
  const isRetryableError = (error: any): boolean => {
    if (!error) return false;
    const code = error.code || "";
    const message = (error.message || "").toLowerCase();

    // Retryable conditions:
    // - JWT expired mid-request (PGRST301)
    // - Network timeouts
    // - Connection errors
    // - Rate limit (429)
    return (
      code === "PGRST301" || // JWT expired
      code === "PGRST504" || // Gateway timeout
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("fetch failed") ||
      error.status === 429 // Rate limit
    );
  };

  const createProduct = async (productData: any, retryAttempt: number = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s exponential backoff

    try {
      // Remove joined relations, read-only fields, and frontend-only fields
      const {
        category,
        subcategory,
        id, // Auto-generated
        created_at, // Auto-set
        updated_at, // Auto-managed by trigger
        view_count, // Should not be set on create
        ...cleanData
      } = productData;

      // ✅ SESSION VALIDATION & REFRESH (prevent mid-save token expiry)
      const { data: sessionData } = await $supabase.auth.getSession();
      if (!sessionData?.session) {
        console.error("[createProduct] ❌ No active session!");
        return {
          success: false,
          error: "Session expired. Please refresh the page and login again.",
        };
      }

      const session = sessionData.session;
      const expiresAt = session.expires_at || 0;
      const expiresIn = expiresAt - Date.now() / 1000;

      // Refresh session if expires in < 60 seconds
      if (expiresIn < 60) {
        const { error: refreshError } = await $supabase.auth.refreshSession();
        if (refreshError) {
          console.warn("[createProduct] Session refresh failed:", refreshError.message);
        }
      }

      // 30-second timeout to prevent infinite hang
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "⏱️ Request timeout: Supabase tidak merespons setelah 30 detik. Kemungkinan: (1) Koneksi internet lambat, (2) Proyek Supabase sedang sleep (free tier), (3) RLS policy blocking.",
              ),
            ),
          30000,
        ),
      );

      // Auto-generate slug jika belum ada
      if (!cleanData.slug && (cleanData.title || cleanData.name)) {
        const base = generateProductSlug(cleanData.title || cleanData.name);
        cleanData.slug = await ensureUniqueProductSlug(base);
      }

      const insertPromise = $supabase.from("catalog_products").insert([cleanData]).select().single();

      const { data, error } = (await Promise.race([insertPromise, timeoutPromise])) as Awaited<typeof insertPromise>;

      if (error) {
        console.error("[createProduct] ❌ Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          retryable: isRetryableError(error),
        });

        // ✅ RETRY LOGIC: If error is transient and retries remaining
        if (isRetryableError(error) && retryAttempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryAttempt];
          console.warn(
            `[createProduct] 🔄 Retrying (${retryAttempt + 1}/${MAX_RETRIES}) after ${delay}ms due to: ${error.message}`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return createProduct(productData, retryAttempt + 1);
        }

        throw error;
      }

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

  const updateProduct = async (id: string, productData: any, oldMediaUrls?: string[]) => {
    try {
      // Remove joined relations, flattened fields, and read-only fields
      const {
        category,
        subcategory,
        category_name,
        category_slug,
        subcategory_name,
        subcategory_slug,
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
      cache.clearPrefix("catalog_product"); // single product cache
      cache.clearPrefix("v_featured_products");
      cache.clearPrefix("v_best_sellers");

      // Delete removed media from Cloudinary (best-effort, parallel)
      if (oldMediaUrls && oldMediaUrls.length > 0) {
        const newUrls = new Set(
          [productData.thumbnail_image, ...(productData.images || []), productData.video_url].filter(Boolean),
        );
        const removedUrls = oldMediaUrls.filter((url) => !newUrls.has(url));
        if (removedUrls.length > 0) {
          await Promise.allSettled(
            removedUrls.map((url) =>
              deleteFileByUrl(url).catch((e) => console.warn("[Cloudinary] Failed to delete:", url, e)),
            ),
          );
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Fetch media URLs before deleting from DB
      const { data: product } = await $supabase
        .from("catalog_products")
        .select("thumbnail_image, images, video_url")
        .eq("id", id)
        .single();

      const { error } = await $supabase.from("catalog_products").delete().eq("id", id);

      if (error) throw error;

      // Invalidate products cache after delete
      cache.clearPrefix("catalog_products");
      cache.clearPrefix("catalog_product"); // single product cache
      cache.clearPrefix("v_featured_products");
      cache.clearPrefix("v_best_sellers");

      // Delete all media from Cloudinary (best-effort, parallel, after DB delete)
      if (product) {
        const urls = [product.thumbnail_image, ...(product.images || []), product.video_url].filter(
          Boolean,
        ) as string[];
        const uniqueUrls = [...new Set(urls)];
        await Promise.allSettled(
          uniqueUrls.map((url) =>
            deleteFileByUrl(url).catch((e) => console.warn("[Cloudinary] Failed to delete:", url, e)),
          ),
        );
      }

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
          { ttl: 24 * 60 * 60 * 1000 }, // Cache for 24 hours (services jarang berubah)
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
            "id, title, name, description, thumbnail_image, price, price_display, stock_status, category_id, subcategory_id, weight, karat",
          )
          .in("id", service.example_products)
          .eq("is_active", true);

        if (productsError) {
          console.error("[getServiceWithProducts] Error fetching service products:", productsError);
        } else {
          products = productsData || [];
        }
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
          { ttl: 30 * 60 * 1000 }, // Cache for 30 minutes
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
          { ttl: 30 * 60 * 1000 }, // Cache for 30 minutes
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
        $supabase.from(table).update({ display_order: item.display_order }).eq("id", item.id),
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

  // ============================================
  // NEW FUNCTIONS FOR STRATEGY A (Page-based routing)
  // ============================================

  /**
   * Get category by slug (for routing)
   */
  const getCategoryBySlug = async (slug: string) => {
    try {
      const cacheKey = cache.generateKey("catalog_category_slug", { slug });

      return await cache.fetchWithCache(
        cacheKey,
        async () => {
          const { data, error } = await $supabase
            .from("catalog_categories")
            .select("*")
            .eq("slug", slug)
            .eq("is_active", true)
            .single();

          if (error) {
            // If not found by slug, try by name (fallback for backward compatibility)
            const { data: fallbackData, error: fallbackError } = await $supabase
              .from("catalog_categories")
              .select("*")
              .ilike("name", slug)
              .eq("is_active", true)
              .limit(1)
              .single();

            if (fallbackError) throw error; // throw original error
            return { success: true, data: fallbackData };
          }

          return { success: true, data };
        },
        { ttl: 60 * 60 * 1000 }, // Cache for 60 minutes
      );
    } catch (error) {
      console.error("[useCatalogManager] Error fetching category by slug:", error);
      return { success: false, error: getErrorMessage(error), data: null };
    }
  };

  /**
   * Get subcategory by slug (for filtering)
   */
  const getSubcategoryBySlug = async (slug: string, categoryId?: string) => {
    try {
      let query = $supabase.from("catalog_subcategories").select("*").eq("slug", slug).eq("is_active", true);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query.limit(1).single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("[useCatalogManager] Error fetching subcategory by slug:", error);
      return { success: false, error: getErrorMessage(error), data: null };
    }
  };

  /**
   * Get related products (same category/subcategory, excluding current product)
   */
  const getRelatedProducts = async (productId: string, limit: number = 6) => {
    try {
      // First, get the current product to know its category/subcategory
      const { data: currentProduct, error: productError } = await $supabase
        .from("catalog_products")
        .select("id, category_id, subcategory_id")
        .eq("id", productId)
        .single();

      if (productError) {
        console.error("[getRelatedProducts] Error fetching current product:", productError);
        throw new Error("Product not found");
      }

      if (!currentProduct) {
        console.error("[getRelatedProducts] Current product not found");
        throw new Error("Product not found");
      }

      // Fetch related products from same subcategory first, then same category
      let query = $supabase
        .from("catalog_products")
        .select(
          `
          id,
          title,
          name,
          thumbnail_image,
          images,
          price,
          price_display,
          category_id,
          subcategory_id,
          category:catalog_categories(id, name, slug),
          subcategory:catalog_subcategories(id, name, slug)
        `,
        )
        .eq("is_active", true)
        .neq("id", productId); // Exclude current product

      // Prioritize same subcategory
      if (currentProduct.subcategory_id) {
        query = query.eq("subcategory_id", currentProduct.subcategory_id);
      } else if (currentProduct.category_id) {
        query = query.eq("category_id", currentProduct.category_id);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        console.error("[getRelatedProducts] Error fetching related products:", error);
        throw error;
      }

      // If not enough products from subcategory, fetch more from category
      if (data && data.length < limit && currentProduct.subcategory_id && currentProduct.category_id) {
        const remaining = limit - data.length;
        const { data: moreData, error: moreError } = await $supabase
          .from("catalog_products")
          .select(
            `
            id,
            title,
            name,
            thumbnail_image,
            images,
            price,
            price_display,
            category_id,
            subcategory_id,
            category:catalog_categories(id, name, slug),
            subcategory:catalog_subcategories(id, name, slug)
          `,
          )
          .eq("is_active", true)
          .eq("category_id", currentProduct.category_id)
          .neq("id", productId)
          .neq("subcategory_id", currentProduct.subcategory_id)
          .limit(remaining);

        if (!moreError && moreData) {
          data.push(...moreData);
        }
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("[useCatalogManager] Error fetching related products:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  return {
    // Categories
    getCategories,
    getCategoryBySlug, // NEW
    createCategory,
    updateCategory,
    deleteCategory,

    // Subcategories
    getSubcategories,
    getSubcategoryBySlug, // NEW
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,

    // Products
    getProducts,
    getProductById,
    getProductBySlug,
    getRelatedProducts, // NEW
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
