<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-4 sm:p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold">{{ product ? "Edit" : "Tambah" }} Produk</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
            <i class="bi bi-x-lg text-lg sm:text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="save" class="space-y-3 sm:space-y-4">
          <!-- Category & Subcategory -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Kategori *</label>
              <select
                v-model="form.category_id"
                required
                @change="filterSubcategories"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Pilih Kategori</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Subkategori *</label>
              <select
                v-model="form.subcategory_id"
                required
                :disabled="!form.category_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Pilih Subkategori</option>
                <option v-for="sub in filteredSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
              </select>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-2">Nama Produk *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Contoh: Kalung Fashion Elegan 18K"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Product description..."
            ></textarea>
          </div>

          <!-- Specs (Simple textarea for now) -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-2">Spesifikasi (satu per baris)</label>
            <textarea
              v-model="specsText"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Emas 18K&#10;Berat: 4.5 gram&#10;Panjang: 45cm"
            ></textarea>
          </div>

          <!-- Karat & Weight -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Kadar Emas *</label>
              <select
                v-model="form.karat"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Pilih Kadar</option>
                <option v-for="gp in goldPrices" :key="gp.karat" :value="gp.karat">
                  {{ gp.karat }} ({{ formatPrice(gp.price_per_gram) }}/gram)
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Berat *</label>
              <div class="flex gap-2">
                <input
                  v-model.number="form.weight_grams"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="4.5"
                />
                <span class="self-center text-sm text-gray-600 whitespace-nowrap">gram</span>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-2">Harga (Rp) *</label>
            <input
              v-model.number="form.price"
              type="number"
              step="1000"
              min="0"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="3500000"
            />
            <p class="text-xs text-gray-500 mt-1">Masukkan harga dalam Rupiah (tanpa titik/koma).</p>
          </div>

          <!-- Calculated Price Display -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <label class="flex items-center gap-2 mb-3">
                  <input v-model="form.price_override" type="checkbox" class="rounded" />
                  <span class="text-sm font-medium text-gray-900">Override Harga Manual</span>
                </label>

                <div v-if="form.price_override">
                  <label class="block text-xs font-medium text-gray-700 mb-2">Harga Custom (Rp)</label>
                  <input
                    v-model.number="form.price"
                    type="number"
                    step="1000"
                    min="0"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="3500000"
                  />
                  <p class="text-xs text-yellow-600 mt-2">⚠️ Harga ini tidak akan berubah saat harga emas update</p>
                </div>

                <div v-else class="space-y-1">
                  <p class="text-xs text-gray-600">Harga Otomatis:</p>
                  <p class="text-xl font-bold text-blue-600">{{ formatPrice(calculatedPrice) }}</p>
                  <p class="text-xs text-gray-500">{{ form.weight_grams || 0 }} gram × {{ currentGoldPricePerGram }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Images Upload -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-2">Gambar Produk</label>
            <p class="text-xs text-gray-500 mb-2 sm:mb-3">
              Gambar pertama akan digunakan sebagai thumbnail. Anda dapat mengupload beberapa gambar untuk galeri.
            </p>
            <CloudinaryUploader
              :key="product?.id || 'new'"
              v-model="imageUrls"
              @uploaded="handleImagesUpload"
              folder="products"
              :single="false"
              :maxFiles="8"
              :maxSize="5"
              :showUrls="false"
            />
          </div>

          <!-- Custom Links (Optional Override) -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold mb-3 text-gray-900">🔗 Link Custom (Opsional)</h4>
            <p class="text-xs text-gray-500 mb-3">
              Kosongkan untuk menggunakan link default berdasarkan kadar. Isi hanya jika produk ini perlu link khusus.
            </p>

            <div class="space-y-3">
              <!-- Custom Shopee Link -->
              <div>
                <label class="block text-xs font-medium mb-2">Link Shopee Produk Spesifik</label>
                <input
                  v-model="form.custom_shopee_link"
                  type="url"
                  placeholder="https://shopee.co.id/Produk-Spesifik-i.123.456"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p class="text-xs text-gray-400 mt-1">Link langsung ke produk ini di Shopee</p>
              </div>

              <!-- Custom WhatsApp -->
              <div>
                <label class="block text-xs font-medium mb-2">Nomor WhatsApp Khusus</label>
                <input
                  v-model="form.custom_whatsapp_number"
                  type="text"
                  placeholder="6281234567890"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p class="text-xs text-gray-400 mt-1">Nomor WA khusus untuk produk ini (format: 62xxx)</p>
              </div>
            </div>
          </div>

          <!-- Flags -->
          <div class="flex flex-col xs:flex-row gap-3 xs:gap-6">
            <label class="flex items-center">
              <input v-model="form.is_featured" type="checkbox" class="mr-2" />
              <span class="text-xs sm:text-sm">Featured Product</span>
            </label>

            <label class="flex items-center">
              <input v-model="form.is_best_seller" type="checkbox" class="mr-2" />
              <span class="text-xs sm:text-sm">Best Seller</span>
            </label>

            <label class="flex items-center">
              <input v-model="form.is_active" type="checkbox" class="mr-2" />
              <span class="text-xs sm:text-sm">Active</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <button
              type="submit"
              :disabled="saving"
              class="w-full sm:flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              {{ saving ? "Menyimpan..." : "Simpan Produk" }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lazy load CloudinaryUploader - only loads when modal is opened
const CloudinaryUploader = defineAsyncComponent(() => import("~/components/CloudinaryUploader.vue"));

const props = defineProps<{
  product?: any;
  categories: any[];
  subcategories: any[];
}>();

const emit = defineEmits(["close", "saved"]);

const { createProduct, updateProduct } = useCatalogManager();
const { getGoldPrices, calculatePrice } = useGoldPricing();
const toast = useToast();

// State
const saving = ref(false);
const specsText = ref("");
const imageUrls = ref<string[]>([]);
const goldPrices = ref<any[]>([]);
const isInitializing = ref(false);

const form = ref<{
  category_id: string;
  subcategory_id: string;
  title: string;
  name: string;
  description: string;
  price: number;
  price_display: string;
  karat: string;
  weight: string;
  weight_grams: number;
  price_override: boolean;
  thumbnail_image: string;
  images: string[];
  specs: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  stock_status: string;
  display_order: number;
  custom_shopee_link: string;
  custom_whatsapp_number: string;
}>({
  category_id: "",
  subcategory_id: "",
  title: "",
  name: "",
  description: "",
  price: 0,
  price_display: "",
  karat: "",
  weight: "",
  weight_grams: 0,
  price_override: false,
  thumbnail_image: "",
  images: [],
  specs: [],
  is_featured: false,
  is_best_seller: false,
  is_active: true,
  stock_status: "available",
  display_order: 0,
  custom_shopee_link: "",
  custom_whatsapp_number: "",
});

// Computed
const filteredSubcategories = computed(() => {
  if (!form.value.category_id) return [];
  return props.subcategories.filter((sub: any) => sub.category_id === form.value.category_id);
});

const calculatedPrice = computed(() => {
  if (!form.value.weight_grams || !form.value.karat) return 0;
  return calculatePrice(form.value.weight_grams, form.value.karat, goldPrices.value);
});

const currentGoldPricePerGram = computed(() => {
  const gp = goldPrices.value.find((g) => g.karat === form.value.karat);
  return gp ? formatPrice(gp.price_per_gram) : "-";
});

// Load gold prices
const loadGoldPrices = async () => {
  const result = await getGoldPrices();
  if (result.success) goldPrices.value = result.data;
};

// Format price
const formatPrice = (price: number) => {
  if (!price) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Update weight string when grams change
watch(
  () => form.value.weight_grams,
  (grams) => {
    if (grams) form.value.weight = `${grams} gram`;
  }
);

// Auto-update price when not overridden
watch([() => form.value.weight_grams, () => form.value.karat], () => {
  // Jangan auto-update saat inisialisasi atau saat override aktif
  if (!isInitializing.value && !form.value.price_override) {
    form.value.price = calculatedPrice.value;
  }
});

const filterSubcategories = () => {
  form.value.subcategory_id = "";
};

// Initialize
onMounted(async () => {
  isInitializing.value = true; // Set flag

  await loadGoldPrices();

  if (props.product) {
    // Copy all product data
    form.value = { ...props.product };

    // Explicitly set description and specs after form assignment
    form.value.description = props.product.description || "";
    form.value.specs = Array.isArray(props.product.specs) ? [...props.product.specs] : [];

    // Initialize imageUrls with existing images
    if (props.product.images && props.product.images.length > 0) {
      imageUrls.value = [...props.product.images];
    } else if (props.product.thumbnail_image) {
      imageUrls.value = [props.product.thumbnail_image];
    }

    // Parse existing weight if numeric not set
    if (!form.value.weight_grams && form.value.weight) {
      const match = form.value.weight.match(/[\d.]+/);
      if (match) form.value.weight_grams = parseFloat(match[0]);
    }

    // Auto-detect apakah harga berbeda dari kalkulasi otomatis
    await nextTick(); // Tunggu goldPrices loaded

    const autoPrice = calculatePrice(form.value.weight_grams || 0, form.value.karat || "", goldPrices.value);

    // Jika harga produk berbeda dari kalkulasi otomatis, tandai sebagai override
    if (form.value.price !== autoPrice && form.value.price > 0) {
      form.value.price_override = true;
    }
  }

  // Set specsText AFTER initialization flag is released
  await nextTick();
  if (props.product && props.product.specs) {
    specsText.value = (props.product.specs || []).join("\n");
  }

  isInitializing.value = false; // Release flag
});

// Watch specs text
watch(specsText, (newValue: string) => {
  // Jangan auto-update saat inisialisasi
  if (!isInitializing.value && newValue !== undefined) {
    form.value.specs = newValue.split("\n").filter((s: string) => s.trim());
  }
});

// Handle images upload
const handleImagesUpload = (urls: string[]) => {
  imageUrls.value = urls;
  form.value.images = urls;

  // Set first image as thumbnail
  if (urls.length > 0) {
    form.value.thumbnail_image = urls[0];
  } else {
    form.value.thumbnail_image = "";
  }
};

// Save
const save = async () => {
  saving.value = true;

  try {
    // Ensure weight string is synced with weight_grams before save
    if (form.value.weight_grams) {
      form.value.weight = `${form.value.weight_grams} gram`;
    }

    // Ensure JSONB arrays are valid
    if (!Array.isArray(form.value.images)) {
      form.value.images = [];
    }
    if (!Array.isArray(form.value.specs)) {
      form.value.specs = [];
    }

    // Set name if not exists (fallback to title)
    if (!form.value.name) {
      form.value.name = form.value.title;
    }

    // Set price_display from price
    if (form.value.price) {
      form.value.price_display = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(form.value.price);
    }

    const result = props.product ? await updateProduct(props.product.id, form.value) : await createProduct(form.value);

    if (result.success) {
      // Show success toast
      toast.success(
        props.product
          ? `Produk "${form.value.title}" berhasil diupdate!`
          : `Produk "${form.value.title}" berhasil ditambahkan!`,
        4000
      );
      emit("saved");
    } else {
      // Show error toast
      toast.error(`Gagal menyimpan produk: ${result.error || "Terjadi kesalahan"}`, 5000);
    }
  } catch (error) {
    console.error("Save error:", error);
    // Show error toast
    toast.error("Terjadi kesalahan saat menyimpan produk. Silakan coba lagi.", 5000);
  } finally {
    saving.value = false;
  }
};
</script>
