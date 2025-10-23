<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">{{ category ? "Edit" : "Add" }} Category</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="save" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium mb-2">Category Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Kalung, Anting, Gelang"
            />
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium mb-2">Slug *</label>
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., kalung (lowercase, no spaces)"
            />
            <p class="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Brief description of this category"
            ></textarea>
          </div>

          <!-- Cover Image -->
          <div>
            <label class="block text-sm font-medium mb-2">Cover Image</label>
            <div v-if="form.cover_image" class="mb-2">
              <img :src="form.cover_image" alt="Cover" class="w-32 h-32 object-cover rounded-lg" />
              <button type="button" @click="form.cover_image = ''" class="mt-2 text-sm text-red-600 hover:text-red-700">
                Remove Image
              </button>
            </div>
            <CloudinaryUploader
              @uploaded="handleImageUpload"
              :uploading="uploading"
              folder="melati-gold/categories"
              :single="true"
            />
          </div>

          <!-- Icon -->
          <div>
            <label class="block text-sm font-medium mb-2">Icon Name</label>
            <input
              v-model="form.icon"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., kalung-icon"
            />
          </div>

          <!-- Display Order -->
          <div>
            <label class="block text-sm font-medium mb-2">Display Order</label>
            <input
              v-model.number="form.display_order"
              type="number"
              min="0"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p class="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          <!-- Is Active -->
          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label for="is_active" class="ml-2 text-sm font-medium">Active (visible on website)</label>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {{ saving ? "Saving..." : "Save Category" }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
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
  category?: any;
}>();

const emit = defineEmits(["close", "saved"]);

const { createCategory, updateCategory } = useCatalogManager();

// State
const saving = ref(false);
const uploading = ref(false);

const form = ref({
  name: "",
  slug: "",
  description: "",
  cover_image: "",
  icon: "",
  display_order: 0,
  is_active: true,
});

// Initialize form
onMounted(() => {
  if (props.category) {
    form.value = { ...props.category };
  }
});

// Auto-generate slug from name
watch(
  () => form.value.name,
  (newName) => {
    if (!props.category) {
      // Only auto-generate for new categories
      form.value.slug = newName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  }
);

// Handle image upload
const handleImageUpload = (urls: string[]) => {
  if (urls.length > 0) {
    form.value.cover_image = urls[0];
  }
  uploading.value = false;
};

// Save category
const save = async () => {
  saving.value = true;

  try {
    const result = props.category
      ? await updateCategory(props.category.id, form.value)
      : await createCategory(form.value);

    if (result.success) {
      emit("saved");
    } else {
      alert("Failed to save category: " + result.error);
    }
  } catch (error) {
    console.error("Save error:", error);
    alert("An error occurred while saving");
  } finally {
    saving.value = false;
  }
};
</script>
