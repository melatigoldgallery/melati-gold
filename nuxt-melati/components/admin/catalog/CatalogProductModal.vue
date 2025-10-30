<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-4 sm:p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold">{{ product ? "Edit" : "Add" }} Produk</h2>
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

          <!-- Title & Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Judul *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., Kalung Fashion Elegan"
              />
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Nama Produk</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., Kalung Fashion Modern"
              />
            </div>
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

          <!-- Price & Display -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Harga (Rp)</label>
              <input
                v-model.number="form.price"
                type="number"
                step="1000"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="3500000"
              />
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Harga Display</label>
              <input
                v-model="form.price_display"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Rp 3.500.000"
              />
            </div>
          </div>

          <!-- Karat & Weight -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Karat</label>
              <input
                v-model="form.karat"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., 18K, 22K"
              />
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Berat</label>
              <input
                v-model="form.weight"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., 4.5 gram"
              />
            </div>
          </div>

          <!-- Images Upload -->
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-2">Gambar Produk</label>
            <p class="text-xs text-gray-500 mb-2 sm:mb-3">
              Gambar pertama akan digunakan sebagai thumbnail. Anda dapat mengupload beberapa gambar untuk galeri.
            </p>
            <CloudinaryUploader
              v-model="imageUrls"
              @uploaded="handleImagesUpload"
              folder="products"
              :single="false"
              :maxFiles="8"
              :maxSize="5"
              :showUrls="false"
            />
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
              {{ saving ? "Saving..." : "Save Product" }}
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
const props = defineProps<{
  product?: any;
  categories: any[];
  subcategories: any[];
}>();

const emit = defineEmits(["close", "saved"]);

const { createProduct, updateProduct } = useCatalogManager();

// State
const saving = ref(false);
const specsText = ref("");
const imageUrls = ref<string[]>([]);

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
  thumbnail_image: string;
  images: string[];
  specs: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  stock_status: string;
  display_order: number;
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
  thumbnail_image: "",
  images: [],
  specs: [],
  is_featured: false,
  is_best_seller: false,
  is_active: true,
  stock_status: "available",
  display_order: 0,
});

// Filtered subcategories
const filteredSubcategories = computed(() => {
  if (!form.value.category_id) return [];
  return props.subcategories.filter((sub: any) => sub.category_id === form.value.category_id);
});

const filterSubcategories = () => {
  form.value.subcategory_id = "";
};

// Initialize
onMounted(() => {
  if (props.product) {
    form.value = { ...props.product };
    specsText.value = (props.product.specs || []).join("\n");

    // Initialize imageUrls with existing images
    if (props.product.images && props.product.images.length > 0) {
      imageUrls.value = [...props.product.images];
    } else if (props.product.thumbnail_image) {
      imageUrls.value = [props.product.thumbnail_image];
    }
  }
});

// Watch specs text
watch(specsText, (newValue: string) => {
  form.value.specs = newValue.split("\n").filter((s: string) => s.trim());
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
    const result = props.product ? await updateProduct(props.product.id, form.value) : await createProduct(form.value);

    if (result.success) {
      emit("saved");
    } else {
      alert("Failed to save: " + result.error);
    }
  } catch (error) {
    console.error("Save error:", error);
    alert("An error occurred");
  } finally {
    saving.value = false;
  }
};
</script>
