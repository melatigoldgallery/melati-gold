<template>
  <div class="bg-white rounded-lg shadow p-3 sm:p-6">
    <!-- Header - Responsive -->
    <div class="mb-4 sm:mb-6">
      <h3 class="text-base sm:text-lg font-semibold mb-1 sm:mb-2">⚙️ Konfigurasi Kadar Emas</h3>
      <p class="text-xs sm:text-sm text-gray-600">Setting link Shopee & WhatsApp untuk kategori kadar emas</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <i class="bi bi-arrow-clockwise animate-spin text-xl sm:text-2xl text-yellow-600"></i>
      <p class="text-xs sm:text-sm text-gray-500 mt-2">Loading...</p>
    </div>

    <!-- Configs List -->
    <div v-else class="space-y-3 sm:space-y-4">
      <div
        v-for="config in configs"
        :key="config.id"
        class="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-yellow-500 transition"
      >
        <!-- Header -->
        <div class="flex items-start sm:items-center justify-between mb-3 gap-2">
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 text-sm sm:text-base truncate">{{ config.name }}</h4>
            <p class="text-xs text-gray-500 mt-0.5">{{ config.karat_list.join(", ") }}</p>
          </div>
          <button
            @click="editConfig(config)"
            class="flex-shrink-0 px-3 py-1.5 sm:py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <i class="bi bi-pencil mr-1"></i>
            <span class="hidden xs:inline">Edit</span>
          </button>
        </div>

        <!-- Info -->
        <div class="space-y-2 sm:space-y-3">
          <!-- Shopee Link -->
          <div class="flex items-start gap-2">
            <i class="bi bi-shop text-gray-400 text-sm sm:text-base mt-0.5 flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500 mb-0.5">Link Shopee</p>
              <a
                :href="config.shopee_store_url"
                target="_blank"
                class="text-blue-600 hover:underline text-xs sm:text-sm break-all line-clamp-2"
              >
                {{ config.shopee_store_url || "-" }}
              </a>
            </div>
          </div>

          <!-- WhatsApp -->
          <div class="flex items-start gap-2">
            <i class="bi bi-whatsapp text-gray-400 text-sm sm:text-base mt-0.5 flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500 mb-0.5">WhatsApp</p>
              <p class="text-gray-900 text-xs sm:text-sm font-medium">{{ config.whatsapp_number || "-" }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal - Mobile Responsive -->
    <div
      v-if="editingConfig"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      @click.self="cancelEdit"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <div class="p-4 sm:p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-xl font-semibold">Edit {{ editingConfig.name }}</h3>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 p-1" type="button">
              <i class="bi bi-x-lg text-lg"></i>
            </button>
          </div>

          <form @submit.prevent="saveConfig" class="space-y-3 sm:space-y-4">
            <!-- Shopee URL -->
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Link Toko Shopee</label>
              <input
                v-model="editForm.shopee_store_url"
                type="url"
                placeholder="https://shopee.co.id/toko-anda"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p class="text-xs text-gray-500 mt-1">Link ke halaman toko Shopee Anda (bukan produk spesifik)</p>
            </div>

            <!-- WhatsApp Number -->
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Nomor WhatsApp</label>
              <input
                v-model="editForm.whatsapp_number"
                type="text"
                placeholder="6281234567890"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p class="text-xs text-gray-500 mt-1">Format: 62xxxx (tanpa +, spasi, atau tanda hubung)</p>
            </div>

            <!-- WhatsApp Message Template -->
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Template Pesan WhatsApp</label>
              <textarea
                v-model="editForm.whatsapp_message_template"
                rows="4"
                placeholder="Halo, saya tertarik dengan {product_name} kadar {karat}"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Placeholder:
                <code class="bg-gray-100 px-1 py-0.5 rounded">{product_name}</code>
                ,
                <code class="bg-gray-100 px-1 py-0.5 rounded">{karat}</code>
                ,
                <code class="bg-gray-100 px-1 py-0.5 rounded">{price}</code>
              </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                type="submit"
                :disabled="saving"
                class="w-full sm:flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2.5 sm:py-2 px-4 rounded-lg font-medium disabled:opacity-50 text-sm sm:text-base"
              >
                <i v-if="saving" class="bi bi-arrow-clockwise animate-spin mr-2"></i>
                {{ saving ? "Menyimpan..." : "Simpan Perubahan" }}
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 sm:py-2 px-4 rounded-lg font-medium text-sm sm:text-base"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Inline implementation for karat config management
const { $supabase } = useNuxtApp();
const supabase = $supabase as any;

const getConfigs = async () => {
  try {
    const { data, error } = await supabase.from("karat_configs").select("*").order("id");

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
};

const updateConfig = async (id: number, updates: any) => {
  try {
    const { data, error } = await supabase.from("karat_configs").update(updates).eq("id", id).select().single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const loading = ref(true);
const saving = ref(false);
const configs = ref<any[]>([]);
const editingConfig = ref<any>(null);
const editForm = ref({
  shopee_store_url: "",
  whatsapp_number: "",
  whatsapp_message_template: "",
});

// Load configs
const loadConfigs = async () => {
  loading.value = true;
  const result = await getConfigs();
  if (result.success) {
    configs.value = result.data;
  }
  loading.value = false;
};

// Edit config
const editConfig = (config: any) => {
  editingConfig.value = config;
  editForm.value = {
    shopee_store_url: config.shopee_store_url || "",
    whatsapp_number: config.whatsapp_number || "",
    whatsapp_message_template: config.whatsapp_message_template || "",
  };
};

// Save config
const saveConfig = async () => {
  if (!editingConfig.value) return;

  saving.value = true;
  const result = await updateConfig(editingConfig.value.id, editForm.value);

  if (result.success) {
    await loadConfigs();
    cancelEdit();
  } else {
    alert("Gagal menyimpan: " + result.error);
  }
  saving.value = false;
};

// Cancel edit
const cancelEdit = () => {
  editingConfig.value = null;
  editForm.value = {
    shopee_store_url: "",
    whatsapp_number: "",
    whatsapp_message_template: "",
  };
};

// Initialize
onMounted(() => {
  loadConfigs();
});
</script>
