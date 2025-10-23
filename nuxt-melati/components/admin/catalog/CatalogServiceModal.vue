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

const { createCustomService, updateCustomService } = useCatalogManager();

// Form state
const form = ref({
  title: "",
  subtitle: "",
  description: "",
  icon: "bi bi-gear",
  duration: "",
  price_info: "",
  display_order: 0,
  is_active: true,
});

const featuresText = ref("");
const saving = ref(false);

// Initialize form with existing data if editing
if (props.service) {
  form.value = {
    title: props.service.title,
    subtitle: props.service.subtitle || "",
    description: props.service.description,
    icon: props.service.icon || "bi bi-gear",
    duration: props.service.duration || "",
    price_info: props.service.price_info || "",
    display_order: props.service.display_order || 0,
    is_active: props.service.is_active ?? true,
  };
  featuresText.value = props.service.features ? props.service.features.join("\n") : "";
}

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
