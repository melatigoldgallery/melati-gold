import type { ProductVariant, StockLog, StockChangeType, VariantFormData } from "~/types/order";
import type { ApiResponse } from "~/types/catalog";

export const useInventoryManager = () => {
  const { $supabase } = useNuxtApp();
  const toast = useToast();

  if (!$supabase) throw new Error("Supabase client is not available");

  const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

  // ============================================
  // VARIANTS
  // ============================================

  const getVariantsByProduct = async (productId: string): Promise<ApiResponse<ProductVariant[]>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .select("*, product:catalog_products(id, title, slug, thumbnail_image, karat, weight_grams)")
        .eq("product_id", productId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return { success: true, data: data ?? [] };
    } catch (error) {
      console.error("[useInventoryManager] getVariantsByProduct:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const getLowStockVariants = async (): Promise<ApiResponse<ProductVariant[]>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .select("*, product:catalog_products(id, title, slug, thumbnail_image)")
        .eq("is_active", true);

      if (error) throw error;

      const lowStock = (data ?? []).filter((v: ProductVariant) => v.current_stock <= v.min_stock_threshold);

      return { success: true, data: lowStock };
    } catch (error) {
      console.error("[useInventoryManager] getLowStockVariants:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const createVariant = async (formData: VariantFormData): Promise<ApiResponse<ProductVariant>> => {
    try {
      const { data, error } = await $supabase.from(TABLES.PRODUCT_VARIANTS).insert(formData).select().single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("[useInventoryManager] createVariant:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateVariant = async (id: string, updates: Partial<VariantFormData>): Promise<ApiResponse<ProductVariant>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("[useInventoryManager] updateVariant:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // STOCK ADJUSTMENT (restock / adjustment)
  // ============================================

  const adjustStock = async (
    variantId: string,
    quantityChange: number,
    changeType: StockChangeType,
    notes?: string,
  ): Promise<ApiResponse<ProductVariant>> => {
    try {
      // Ambil stok terkini
      const { data: current, error: fetchErr } = await $supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .select("id, current_stock, min_stock_threshold")
        .eq("id", variantId)
        .single();

      if (fetchErr) throw fetchErr;

      const newStock = current.current_stock + quantityChange;
      if (newStock < 0) throw new Error("Stok tidak bisa lebih kecil dari 0");

      const { data, error } = await $supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", variantId)
        .select()
        .single();

      if (error) throw error;

      // Manual log (trigger DB juga menulis, tapi ini untuk menyertakan changeType & notes spesifik)
      await $supabase.from(TABLES.STOCK_LOGS).insert({
        variant_id: variantId,
        change_type: changeType,
        quantity_change: quantityChange,
        stock_before: current.current_stock,
        stock_after: newStock,
        notes: notes ?? null,
      });

      if (newStock <= current.min_stock_threshold) {
        toast.warning(`Stok varian ini tersisa ${newStock} — di bawah batas minimum!`);
      }

      return { success: true, data };
    } catch (error) {
      console.error("[useInventoryManager] adjustStock:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // STOCK LOGS
  // ============================================

  const getStockLogs = async (variantId: string, limit = 20): Promise<ApiResponse<StockLog[]>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.STOCK_LOGS)
        .select("*, variant:product_variants(id, sku, variant_label)")
        .eq("variant_id", variantId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data ?? [] };
    } catch (error) {
      console.error("[useInventoryManager] getStockLogs:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  // ============================================
  // SKU GENERATOR
  // ============================================

  const generateSku = (karatType: string, categoryCode: string, sequence: number): string => {
    const date = new Date()
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "")
      .split("")
      .reverse()
      .join(""); // YYYYMMDD
    const seq = String(sequence).padStart(3, "0");
    return `MGS-${karatType.toUpperCase()}-${categoryCode.toUpperCase()}-${date}-${seq}`;
  };

  return {
    getVariantsByProduct,
    getLowStockVariants,
    createVariant,
    updateVariant,
    adjustStock,
    getStockLogs,
    generateSku,
  };
};
