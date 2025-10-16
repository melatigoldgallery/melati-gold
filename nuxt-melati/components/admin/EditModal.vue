<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
      <div class="p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold">
            {{ item ? "Edit" : "Add" }}
            {{ section === "products" ? "Product" : section === "services" ? "Service" : "Content" }}
          </h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 p-2 -mr-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="save" class="space-y-4 sm:space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium mb-2">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm resize-y"
            ></textarea>
          </div>

          <!-- Price (only for products) -->
          <div v-if="section === 'products'">
            <label class="block text-sm font-medium mb-1">Price (IDR)</label>
            <input v-model.number="form.price" type="number" class="w-full border rounded px-3 py-2" />
          </div>

          <!-- Karat & Weight (only for products) -->
          <div v-if="section === 'products'" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Karat</label>
              <input
                v-model="form.karat"
                type="text"
                placeholder="e.g., 16K, 17K"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Weight</label>
              <input
                v-model="form.weight"
                type="text"
                placeholder="e.g., 2.5 gr"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
              />
            </div>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-sm font-medium mb-2">Image URL</label>
            <input
              v-model="form.imageUrl"
              type="url"
              placeholder="https://..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
            />
          </div>

          <!-- Item Key -->
          <div>
            <label class="block text-sm font-medium mb-1">Item Key (for reference)</label>
            <input
              v-model="form.itemKey"
              type="text"
              required
              placeholder="e.g., featured_1, service_consultation"
              class="w-full border rounded px-3 py-2"
            />
          </div>

          <!-- Display Order -->
          <div>
            <label class="block text-sm font-medium mb-1">Display Order</label>
            <input v-model.number="form.displayOrder" type="number" min="0" class="w-full border rounded px-3 py-2" />
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4 sm:pt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="w-full sm:w-auto px-4 py-2 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base font-medium transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="w-full sm:w-auto px-4 py-2 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium transition-colors order-1 sm:order-2"
            >
              {{ item ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  section: string;
  item?: any;
}>();

const emit = defineEmits(["save", "close"]);

const form = ref({
  title: "",
  description: "",
  price: undefined,
  imageUrl: "",
  itemKey: "",
  displayOrder: 0,
  karat: "",
  weight: "",
});

const save = () => {
  const metadata: any = {};

  if (props.section === "products") {
    metadata.karat = form.value.karat;
    metadata.weight = form.value.weight;
  }

  emit("save", {
    ...props.item,
    sectionKey: props.section,
    title: form.value.title,
    description: form.value.description,
    price: form.value.price,
    imageUrl: form.value.imageUrl,
    itemKey: form.value.itemKey,
    displayOrder: form.value.displayOrder,
    metadata,
  });
};

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      form.value = {
        title: newItem.title || "",
        description: newItem.description || "",
        price: newItem.price,
        imageUrl: newItem.imageUrl || "",
        itemKey: newItem.itemKey || "",
        displayOrder: newItem.displayOrder || 0,
        karat: newItem.metadata?.karat || "",
        weight: newItem.metadata?.weight || "",
      };
    } else {
      form.value = {
        title: "",
        description: "",
        price: undefined,
        imageUrl: "",
        itemKey: "",
        displayOrder: 0,
        karat: "",
        weight: "",
      };
    }
  },
  { immediate: true }
);
</script>
