
interface KaratConfig {
  id: string;
  category: string;
  name: string;
  karat_list: string[];
  shopee_store_url: string;
  whatsapp_number: string;
  whatsapp_message_template: string;
  is_active: boolean;
}

interface ProductContact {
  shopee_url: string;
  whatsapp_number: string;
  whatsapp_message: string;
}

export const useKaratConfig = () => {
  const { $supabase } = useNuxtApp();
  const supabase = $supabase;

  // Get semua konfigurasi
  const getConfigs = async () => {
    if (!supabase) return { success: false, error: "Supabase not configured", data: [] };
    try {
      const { data, error } = await supabase
        .from("karat_configurations")
        .select("*")
        .eq("is_active", true)
        .order("category");

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Error fetching karat configs:", error);
      return { success: false, error: error.message, data: [] };
    }
  };

  // Get config berdasarkan kadar (helper utama)
  const getConfigByKarat = async (karat: string): Promise<KaratConfig | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("karat_configurations").select("*").eq("is_active", true);

      if (error) throw error;

      // Cari config yang karat_list-nya mengandung kadar ini
      const config = data?.find((c: KaratConfig) => c.karat_list.includes(karat));
      return config || null;
    } catch (error) {
      console.error("Error getting config by karat:", error);
      return null;
    }
  };

  // Update konfigurasi
  const updateConfig = async (id: string, updates: Partial<KaratConfig>) => {
    if (!supabase) return { success: false, error: "Supabase not configured" };
    try {
      const { data, error } = await supabase
        .from("karat_configurations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating config:", error);
      return { success: false, error: error.message };
    }
  };

  // Get contact info untuk produk (dengan fallback ke default)
  const getProductContact = async (product: any): Promise<ProductContact> => {
    // Jika produk punya custom link/WA, gunakan itu
    if (product.custom_shopee_link || product.custom_whatsapp_number) {
      const config = await getConfigByKarat(product.karat);
      return {
        shopee_url: product.custom_shopee_link || config?.shopee_store_url || "",
        whatsapp_number: product.custom_whatsapp_number || config?.whatsapp_number || "",
        whatsapp_message: formatWhatsAppMessage(
          config?.whatsapp_message_template || "Halo, saya tertarik dengan {product_name}",
          product
        ),
      };
    }

    // Gunakan konfigurasi default berdasarkan kadar
    const config = await getConfigByKarat(product.karat);
    if (!config) {
      return {
        shopee_url: "",
        whatsapp_number: "",
        whatsapp_message: `Halo, saya tertarik dengan ${product.title}`,
      };
    }

    return {
      shopee_url: config.shopee_store_url,
      whatsapp_number: config.whatsapp_number,
      whatsapp_message: formatWhatsAppMessage(config.whatsapp_message_template, product),
    };
  };

  // Format template WhatsApp message
  const formatWhatsAppMessage = (template: string, product: any): string => {
    return template
      .replace("{product_name}", product.title || "")
      .replace("{karat}", product.karat || "")
      .replace("{price}", formatPrice(product.price));
  };

  // Helper format harga
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Generate WhatsApp link
  const getWhatsAppLink = (number: string, message: string): string => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encodedMessage}`;
  };

  return {
    getConfigs,
    getConfigByKarat,
    updateConfig,
    getProductContact,
    getWhatsAppLink,
  };
};
