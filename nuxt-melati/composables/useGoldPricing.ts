// composables/useGoldPricing.ts
export const useGoldPricing = () => {
  const { $supabase } = useNuxtApp();
  if (!$supabase) throw new Error("Supabase client not available");

  // Get all active gold prices
  const getGoldPrices = async () => {
    const { data, error } = await $supabase
      .from("gold_price_settings")
      .select("*")
      .eq("is_active", true)
      .order("karat");

    return { success: !error, data: data || [], error: error?.message };
  };

  // Get price history
  const getPriceHistory = async (karat?: string, limit = 50) => {
    let query = $supabase
      .from("gold_price_history")
      .select("*, admin_users!changed_by(full_name)")
      .order("changed_at", { ascending: false })
      .limit(limit);

    if (karat) query = query.eq("karat", karat);

    const { data, error } = await query;
    return { success: !error, data: data || [], error: error?.message };
  };

  // Update gold price (with history logging via trigger)
  const updateGoldPrice = async (karat: string, pricePerGram: number, userId?: string) => {
    const { error } = await $supabase
      .from("gold_price_settings")
      .update({
        price_per_gram: pricePerGram,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("karat", karat);

    return { success: !error, error: error?.message };
  };

  // Calculate single product price
  const calculatePrice = (weightGrams: number, karat: string, goldPrices: any[]) => {
    const goldPrice = goldPrices.find((gp) => gp.karat === karat);
    if (!goldPrice || !weightGrams) return 0;
    return Math.round(weightGrams * goldPrice.price_per_gram);
  };

  // Recalculate all product prices (bulk update)
  const recalculateAllPrices = async () => {
    try {
      // Get current gold prices
      const pricesResult = await getGoldPrices();
      if (!pricesResult.success) throw new Error("Failed to fetch gold prices");

      // Get products that need recalculation
      const { data: products, error: productsError } = await $supabase
        .from("catalog_products")
        .select("id, karat, weight_grams")
        .eq("price_override", false)
        .not("weight_grams", "is", null);

      if (productsError) throw new Error(productsError.message);

      // Calculate and update each product
      const updates = products?.map((product) => {
        const newPrice = calculatePrice(product.weight_grams, product.karat, pricesResult.data);

        return $supabase
          .from("catalog_products")
          .update({
            price: newPrice,
            base_price: newPrice,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);
      });

      await Promise.all(updates || []);

      return { success: true, count: products?.length || 0 };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Get affected products count by karat
  const getAffectedProductsCount = async (karat: string) => {
    const { count, error } = await $supabase
      .from("catalog_products")
      .select("*", { count: "exact", head: true })
      .eq("karat", karat)
      .eq("price_override", false)
      .not("weight_grams", "is", null);

    return { success: !error, count: count || 0, error: error?.message };
  };

  return {
    getGoldPrices,
    getPriceHistory,
    updateGoldPrice,
    calculatePrice,
    recalculateAllPrices,
    getAffectedProductsCount,
  };
};
