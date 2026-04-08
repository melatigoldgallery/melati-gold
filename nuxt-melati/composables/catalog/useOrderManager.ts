import type { Order, OrderItem, OrderFormData, OrderFilters, OrderStatus } from "~/types/order";
import type { ApiResponse, PaginationMeta } from "~/types/catalog";

export const useOrderManager = () => {
  const { $supabase } = useNuxtApp();

  if (!$supabase) throw new Error("Supabase client is not available");

  const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

  // ============================================
  // READ
  // ============================================

  const getOrders = async (filters: OrderFilters): Promise<ApiResponse<Order[]>> => {
    try {
      const { page, limit, status, search } = filters;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = $supabase
        .from(TABLES.ORDERS)
        .select("*, items:order_items(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (status) query = query.eq("status", status);
      if (search) {
        query = query.or(
          `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`,
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const pagination: PaginationMeta = {
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      };

      return { success: true, data: data ?? [], pagination };
    } catch (error) {
      console.error("[useOrderManager] getOrders:", error);
      return { success: false, error: getErrorMessage(error), data: [] };
    }
  };

  const getOrderById = async (id: string): Promise<ApiResponse<Order>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.ORDERS)
        .select("*, items:order_items(*, product:catalog_products(id, title, slug, thumbnail_image))")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("[useOrderManager] getOrderById:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // CREATE
  // ============================================

  const createOrder = async (formData: OrderFormData): Promise<ApiResponse<Order>> => {
    try {
      const total = formData.items.reduce((sum, item) => sum + item.subtotal, 0);

      const { data: order, error: orderError } = await $supabase
        .from(TABLES.ORDERS)
        .insert({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          payment_method: formData.payment_method,
          notes: formData.notes,
          total_amount: total,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = formData.items.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await $supabase.from(TABLES.ORDER_ITEMS).insert(itemsToInsert);
      if (itemsError) throw itemsError;

      return { success: true, data: order };
    } catch (error) {
      console.error("[useOrderManager] createOrder:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // UPDATE STATUS
  // ============================================

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.ORDERS)
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("[useOrderManager] updateOrderStatus:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const updateShipping = async (id: string, tracking: string, courier: string): Promise<ApiResponse<Order>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.ORDERS)
        .update({
          shipping_tracking_number: tracking,
          shipping_courier: courier,
          status: "shipped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("[useOrderManager] updateShipping:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const uploadPaymentProof = async (orderId: string, proofUrl: string): Promise<ApiResponse<Order>> => {
    try {
      const { data, error } = await $supabase
        .from(TABLES.ORDERS)
        .update({
          payment_proof_url: proofUrl,
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("[useOrderManager] uploadPaymentProof:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  // ============================================
  // DASHBOARD STATS
  // ============================================

  const getDashboardStats = async () => {
    try {
      const { data, error } = await $supabase.from(TABLES.ORDERS).select("status, total_amount, created_at");

      if (error) throw error;

      const now = new Date();
      const thisMonth = data?.filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      return {
        success: true,
        data: {
          total_orders: data?.length ?? 0,
          pending: data?.filter((o) => o.status === "pending").length ?? 0,
          processing: data?.filter((o) => ["paid", "processing"].includes(o.status)).length ?? 0,
          completed: data?.filter((o) => o.status === "completed").length ?? 0,
          revenue_this_month:
            thisMonth?.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0,
        },
      };
    } catch (error) {
      console.error("[useOrderManager] getDashboardStats:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  };

  return {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateShipping,
    uploadPaymentProof,
    getDashboardStats,
  };
};
