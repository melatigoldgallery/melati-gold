<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
    <div class="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <h3 class="text-lg sm:text-xl font-semibold">
          {{ subcategory ? "Edit Subkatigori" : "Tambah Subkatigori Baru" }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <i class="bi bi-x-lg text-xl sm:text-2xl"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <!-- Category Selection -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Parent Category
            <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.category_id"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Pilih Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Name -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Nama Subkategori
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            @input="autoGenerateSlug"
            type="text"
            required
            placeholder="e.g. Fashion, Anak, Pria"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Slug
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.slug"
            type="text"
            required
            placeholder="fashion-anak-pria"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <p class="text-xs text-gray-500 mt-1">URL-friendly version (auto-generated from name)</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Brief description of this subcategory"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          ></textarea>
        </div>

        <!-- Cover Image -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <p class="text-xs text-gray-500 mb-2">Upload cover image untuk Subkategori ini</p>
          <CloudinaryUploader
            v-model="imageUrls"
            @uploaded="handleImageUpload"
            folder="subcategories"
            :single="true"
            :maxSize="5"
            :showUrls="false"
          />
        </div>

        <!-- Display Order -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Urutan Display</label>
          <input
            v-model.number="form.display_order"
            type="number"
            min="0"
            placeholder="0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <p class="text-xs text-gray-500 mt-1">Nomor yang lebih rendah muncul pertama</p>
        </div>

        <!-- Active Status -->
        <div class="flex items-center">
          <input v-model="form.is_active" type="checkbox" id="is_active" class="mr-2" />
          <label for="is_active" class="text-xs sm:text-sm text-gray-700">Aktif (terlihat oleh pengguna)</label>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="w-full sm:flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            {{ saving ? "Saving..." : subcategory ? "Update Subcategory" : "Create Subcategory" }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lazy load CloudinaryUploader
const CloudinaryUploader = defineAsyncComponent(() => import("~/components/CloudinaryUploader.vue"));

const props = defineProps<{
  subcategory?: any;
  categories: any[];
}>();

const emit = defineEmits(["close", "saved"]);

const { createSubcategory, updateSubcategory } = useCatalogManager();

// Form state
const form = ref({
  category_id: "",
  name: "",
  slug: "",
  description: "",
  cover_image: "",
  display_order: 0,
  is_active: true,
});

const saving = ref(false);
const imageUrls = ref<string[]>([]);

// Initialize form with existing data if editing
if (props.subcategory) {
  form.value = {
    category_id: props.subcategory.category_id || "",
    name: props.subcategory.name,
    slug: props.subcategory.slug,
    description: props.subcategory.description || "",
    cover_image: props.subcategory.cover_image || "",
    display_order: props.subcategory.display_order || 0,
    is_active: props.subcategory.is_active ?? true,
  };

  // Initialize imageUrls with existing cover_image
  if (props.subcategory.cover_image) {
    imageUrls.value = [props.subcategory.cover_image];
  }
}

// Auto-generate slug from name
const autoGenerateSlug = () => {
  if (!props.subcategory) {
    // Only auto-generate for new subcategories
    form.value.slug = form.value.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
};

// Handle image upload
const handleImageUpload = (urls: string[]) => {
  if (urls.length > 0) {
    form.value.cover_image = urls[0];
    imageUrls.value = urls;
  } else {
    form.value.cover_image = "";
    imageUrls.value = [];
  }
};

// Handle form submission
const handleSubmit = async () => {
  saving.value = true;

  try {
    const result = props.subcategory
      ? await updateSubcategory(props.subcategory.id, form.value)
      : await createSubcategory(form.value);

    if (result.success) {
      emit("saved");
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error saving subcategory:", error);
    alert("Failed to save subcategory");
  } finally {
    saving.value = false;
  }
};
</script>
