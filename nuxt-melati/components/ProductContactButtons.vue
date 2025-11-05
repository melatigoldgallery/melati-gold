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

const { getProductContact, getWhatsAppLink } = useKaratConfig();

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
