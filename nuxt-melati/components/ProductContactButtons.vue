<template>
  <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
    <!-- Tombol Shopee -->
    <a
      v-if="contact.shopee_url"
      :href="contact.shopee_url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
    >
      <i class="bi bi-shop text-base sm:text-lg"></i>
      <span>Beli di Shopee</span>
    </a>

    <!-- Tombol WhatsApp -->
    <a
      v-if="contact.whatsapp_number"
      :href="whatsappLink"
      target="_blank"
      rel="noopener noreferrer"
      class="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
    >
      <i class="bi bi-whatsapp text-base sm:text-lg"></i>
      <span>Chat WhatsApp</span>
    </a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: any;
}>();

// Inline implementation for product contact
const { $supabase } = useNuxtApp();
const supabase = $supabase as any;

const getProductContact = async (product: any) => {
  try {
    // Get karat config based on product's karat
    const { data, error } = await supabase
      .from("karat_configurations")
      .select("*")
      .contains("karat_list", [product.karat])
      .single();

    if (error) throw error;

    if (data) {
      // Replace placeholders in message template
      let message = data.whatsapp_message_template || "Halo, saya tertarik dengan {product_name}";
      message = message.replace("{product_name}", product.title || product.name);
      message = message.replace("{karat}", product.karat || "");
      message = message.replace("{price}", product.price ? `Rp ${product.price.toLocaleString()}` : "");

      return {
        shopee_url: data.shopee_store_url || "",
        whatsapp_number: data.whatsapp_number || "",
        whatsapp_message: message,
      };
    }
  } catch (error) {
    console.error("Error getting product contact:", error);
  }

  // Fallback to default
  return {
    shopee_url: "",
    whatsapp_number: "6281234567890",
    whatsapp_message: `Halo, saya tertarik dengan ${product.title || product.name}`,
  };
};

const getWhatsAppLink = (number: string, message: string) => {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

// Load contact info untuk produk ini
const contact = ref({
  shopee_url: "",
  whatsapp_number: "",
  whatsapp_message: "",
});

const whatsappLink = computed(() => {
  if (!contact.value.whatsapp_number || !contact.value.whatsapp_message) {
    return "#";
  }
  return getWhatsAppLink(contact.value.whatsapp_number, contact.value.whatsapp_message);
});

// Load data
const loadContact = async () => {
  const result = await getProductContact(props.product);
  contact.value = result;
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
  }
);
</script>
