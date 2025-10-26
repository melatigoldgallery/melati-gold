<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h3 class="text-xl font-semibold">
          {{ service ? "Edit Custom Service" : "Add New Custom Service" }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="bi bi-x-lg text-2xl"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Title
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="e.g. Konsultasi Desain Perhiasan"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <!-- Subtitle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            v-model="form.subtitle"
            type="text"
            placeholder="Short tagline"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description
            <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            required
            placeholder="Detailed description of the service"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          ></textarea>
        </div>

        <!-- Icon (Bootstrap Icons class) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Icon
            <span class="text-gray-500">(Bootstrap Icons class)</span>
          </label>
          <input
            v-model="form.icon"
            type="text"
            placeholder="bi bi-tools"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <p class="text-xs text-gray-500 mt-1">
            Find icons at
            <a href="https://icons.getbootstrap.com/" target="_blank" class="text-blue-600 hover:underline">
              Bootstrap Icons
            </a>
          </p>
        </div>

        <!-- Features (one per line) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Features</label>
          <textarea
            v-model="featuresText"
            rows="4"
            placeholder="Enter each feature on a new line:&#10;Konsultasi gratis&#10;Design custom sesuai keinginan&#10;Revisi unlimited"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">One feature per line</p>
        </div>

        <!-- Service Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
          <p class="text-xs text-gray-500 mb-2">Upload an image to represent this service</p>
          <CloudinaryUploader
            v-model="imageUrls"
            @uploaded="handleImageUpload"
            folder="services"
            :single="true"
            :maxSize="5"
            :showUrls="false"
          />
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            v-model="form.duration"
            type="text"
            placeholder="e.g. 30-60 menit, 1-2 minggu"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <!-- Price Info -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Price Info</label>
          <input
            v-model="form.price_info"
            type="text"
            placeholder="e.g. Gratis, Mulai dari Rp 500.000"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <!-- Example Products -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Contoh Produk
            <span class="text-gray-500 text-xs font-normal">(Opsional - untuk ditampilkan di website)</span>
          </label>

          <!-- Loading State -->
          <div v-if="loadingProducts" class="text-center py-4">
            <div
              class="inline-block w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="text-sm text-gray-500 mt-2">Memuat produk...</p>
          </div>

          <!-- Product Selection -->
          <div v-else>
            <!-- Search -->
            <div class="mb-3">
              <input
                v-model="productSearch"
                type="text"
                placeholder="Cari produk..."
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <!-- Selected Products Display -->
            <div v-if="selectedProductIds.length > 0" class="mb-3">
              <p class="text-xs text-gray-600 mb-2">Produk terpilih ({{ selectedProductIds.length }}):</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="productId in selectedProductIds"
                  :key="productId"
                  class="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{{ getProductTitle(productId) }}</span>
                  <button type="button" @click="toggleProduct(productId)" class="hover:text-yellow-900">
                    <i class="bi bi-x text-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product List -->
            <div class="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              <div v-if="filteredProducts.length === 0" class="p-4 text-center text-gray-500 text-sm">
                {{ productSearch ? "Tidak ada produk yang cocok" : "Belum ada produk tersedia" }}
              </div>
              <label
                v-for="product in filteredProducts"
                :key="product.id"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  :checked="selectedProductIds.includes(product.id)"
                  @change="toggleProduct(product.id)"
                  class="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded"
                />
                <img
                  v-if="product.thumbnail_image"
                  :src="product.thumbnail_image"
                  :alt="product.title"
                  class="w-12 h-12 object-cover rounded"
                />
                <div v-else class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <i class="bi bi-image text-gray-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-gray-900 truncate">{{ product.title }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ product.subtitle || "No subtitle" }}</p>
                  <p class="text-xs text-yellow-600">{{ formatPrice(product.price) }}</p>
                </div>
                <span v-if="product.stock <= 0" class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Habis</span>
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              <i class="bi bi-info-circle mr-1"></i>
              Pilih 3-6 produk sebagai contoh untuk layanan ini
            </p>
          </div>
        </div>

        <!-- Display Order -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input
            v-model.number="form.display_order"
            type="number"
            min="0"
            placeholder="0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <p class="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        <!-- Active Status -->
        <div class="flex items-center">
          <input v-model="form.is_active" type="checkbox" id="service_is_active" class="mr-2" />
          <label for="service_is_active" class="text-sm text-gray-700">Active (visible to users)</label>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {{ saving ? "Saving..." : service ? "Update Service" : "Create Service" }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  service?: any;
}>();

const emit = defineEmits(["close", "saved"]);

const { createCustomService, updateCustomService, getProducts } = useCatalogManager();

// Form state
const form = ref({
  title: "",
  subtitle: "",
  description: "",
  icon: "bi bi-gear",
  image_url: "",
  duration: "",
  price_info: "",
  display_order: 0,
  is_active: true,
});

const featuresText = ref("");
const saving = ref(false);
const imageUrls = ref<string[]>([]);

// Products state
const allProducts = ref<any[]>([]);
const loadingProducts = ref(true);
const productSearch = ref("");
const selectedProductIds = ref<string[]>([]);

// Load all active products for selection
const loadProducts = async () => {
  loadingProducts.value = true;
  const result = await getProducts({});
  if (result.success) {
    // Filter only active products
    allProducts.value = (result.data || []).filter((p: any) => p.is_active);
  }
  loadingProducts.value = false;
};

// Computed filtered products based on search
const filteredProducts = computed(() => {
  if (!productSearch.value) return allProducts.value;
  const search = productSearch.value.toLowerCase();
  return allProducts.value.filter(
    (p) =>
      p.title?.toLowerCase().includes(search) ||
      p.subtitle?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
  );
});

// Toggle product selection
const toggleProduct = (productId: string) => {
  const index = selectedProductIds.value.indexOf(productId);
  if (index > -1) {
    selectedProductIds.value.splice(index, 1);
  } else {
    selectedProductIds.value.push(productId);
  }
};

// Get product title by ID
const getProductTitle = (productId: string) => {
  const product = allProducts.value.find((p) => p.id === productId);
  return product?.title || "Unknown";
};

// Format price helper
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Initialize form with existing data if editing
if (props.service) {
  form.value = {
    title: props.service.title,
    subtitle: props.service.subtitle || "",
    description: props.service.description,
    icon: props.service.icon || "bi bi-gear",
    image_url: props.service.image_url || "",
    duration: props.service.duration || "",
    price_info: props.service.price_info || "",
    display_order: props.service.display_order || 0,
    is_active: props.service.is_active ?? true,
  };
  featuresText.value = props.service.features ? props.service.features.join("\n") : "";

  // Initialize imageUrls with existing image
  if (props.service.image_url) {
    imageUrls.value = [props.service.image_url];
  }

  // Initialize selected products
  if (props.service.example_products && Array.isArray(props.service.example_products)) {
    selectedProductIds.value = [...props.service.example_products];
  }
}

// Load products on mount
onMounted(() => {
  loadProducts();
});

// Handle image upload
const handleImageUpload = (urls: string[]) => {
  if (urls.length > 0) {
    form.value.image_url = urls[0];
    imageUrls.value = urls;
  } else {
    form.value.image_url = "";
    imageUrls.value = [];
  }
};

// Handle form submission
const handleSubmit = async () => {
  saving.value = true;

  try {
    // Convert features text to array
    const features = featuresText.value
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const serviceData = {
      ...form.value,
      features,
      example_products: selectedProductIds.value, // Add selected products
    };

    const result = props.service
      ? await updateCustomService(props.service.id, serviceData)
      : await createCustomService(serviceData);

    if (result.success) {
      emit("saved");
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error saving service:", error);
    alert("Failed to save service");
  } finally {
    saving.value = false;
  }
};
</script>
