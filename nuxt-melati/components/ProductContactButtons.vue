<template>
  <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
    <!-- Tombol Shopee -->
    <a
      v-if="contact.shopee_url"
      :href="contact.shopee_url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-3 sm:px-4 lg:px-4 py-2 sm:py-2.5 lg:py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-sm"
    >
      <BuildingStorefrontIcon class="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Beli di Shopee</span>
    </a>

    <!-- Tombol Tokopedia -->
    <a
      v-if="contact.tokopedia_url"
      :href="contact.tokopedia_url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 sm:px-4 lg:px-4 py-2 sm:py-2.5 lg:py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-sm"
    >
      <ShoppingBagIcon class="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Beli di Tokopedia</span>
    </a>

    <!-- Tombol WhatsApp - Trigger Modal -->
    <button
      v-if="allConfigs.length > 0"
      @click="showModal = true"
      class="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-3 sm:px-4 lg:px-4 py-2 sm:py-2.5 lg:py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-sm"
    >
      <PhoneIcon class="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Chat WhatsApp</span>
    </button>
  </div>

  <!-- Modal Pilih Admin WhatsApp -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">Pilih Admin WhatsApp</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-sm text-gray-600 mb-5">Pilih admin yang ingin Anda hubungi:</p>

        <!-- Admin Cards -->
        <div class="space-y-3">
          <button
            v-for="config in allConfigs"
            :key="config.id"
            @click="chatWithAdmin(config)"
            class="w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 rounded-lg p-4 transition-all duration-200 text-left group"
          >
            <div class="flex items-start gap-3">
              <!-- WhatsApp Icon -->
              <div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <PhoneIcon class="w-6 h-6 text-white" />
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 text-sm sm:text-base mb-1">{{ config.name }}</h4>
                <p class="text-xs sm:text-sm text-gray-600 mb-1">Khusus: {{ config.karat_list.join(", ") }}</p>
                <p class="text-xs text-green-700 font-medium">📱 {{ formatPhoneNumber(config.whatsapp_number) }}</p>
              </div>
              <!-- Arrow Icon -->
              <div class="flex-shrink-0 text-green-500 group-hover:translate-x-1 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { BuildingStorefrontIcon, ShoppingBagIcon, PhoneIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  product: any;
}>();

// Inline implementation for product contact
const { $supabase } = useNuxtApp();
const supabase = $supabase as any;

// Modal state
const showModal = ref(false);

// All karat configurations (both kadar_muda & kadar_tua)
const allConfigs = ref<any[]>([]);

// Contact info untuk Shopee & Tokopedia (dari karat config yang match)
const contact = ref({
  shopee_url: "",
  tokopedia_url: "",
});

// Fetch ALL karat configurations
const getAllConfigs = async () => {
  try {
    const { data, error } = await supabase
      .from("karat_configurations")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting karat configs:", error);
    return [];
  }
};

// Get Shopee/Tokopedia URL from matching config
const getContactUrls = async (product: any) => {
  try {
    const { data, error } = await supabase
      .from("karat_configurations")
      .select("shopee_store_url, tokopedia_store_url")
      .contains("karat_list", [product.karat])
      .single();

    if (error) throw error;

    return {
      shopee_url: product.custom_shopee_link || data?.shopee_store_url || "",
      tokopedia_url: data?.tokopedia_store_url || "",
    };
  } catch (error) {
    console.error("Error getting contact URLs:", error);
    return { shopee_url: "", tokopedia_url: "" };
  }
};

// Generate WhatsApp message from template
const generateWhatsAppMessage = (config: any, product: any): string => {
  const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
  let message = config.whatsapp_message_template || "Halo, saya tertarik dengan {product_name}";

  message = message.replace("{product_name}", product.title || product.name);
  message = message.replace("{karat}", product.karat || "");
  message = message.replace("{price}", product.price ? `Rp ${product.price.toLocaleString()}` : "");
  message = message.replace("{product_link}", productUrl);

  return message;
};

// Chat with selected admin
const chatWithAdmin = (config: any) => {
  // Priority: custom WhatsApp number (if set on product) > config WhatsApp
  const whatsappNumber = props.product.custom_whatsapp_number || config.whatsapp_number;

  if (!whatsappNumber) {
    alert("Nomor WhatsApp tidak tersedia");
    return;
  }

  const message = generateWhatsAppMessage(config, props.product);
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Close modal and redirect
  showModal.value = false;
  window.open(waLink, "_blank", "noopener,noreferrer");
};

// Format phone number for display (62812xxx → +62 812 xxx)
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  // Add + prefix and spaces for readability
  return phone.replace(/^(\d{2})(\d{3,4})/, "+$1 $2 ");
};

// Load data
const loadContact = async () => {
  // Load all configs for modal
  allConfigs.value = await getAllConfigs();

  // Load Shopee/Tokopedia URLs
  contact.value = await getContactUrls(props.product);
};

// Initialize
onMounted(() => {
  loadContact();
});

// Watch for product changes
watch(
  () => props.product,
  () => {
    loadContact();
  },
);
</script>
