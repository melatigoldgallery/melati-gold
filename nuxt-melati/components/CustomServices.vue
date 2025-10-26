<script setup lang="ts">
// Emit event untuk membuka modal service
const emit = defineEmits<{
  (e: "open-service", service: any): void;
}>();

// Fetch custom services from database
const { getCustomServices } = useCatalogManager();

// State
const services = ref<any[]>([]);
const loading = ref(true);

// Load services
const loadServices = async () => {
  loading.value = true;

  const result = await getCustomServices();

  if (result.success) {
    // Filter only active services and sort by display_order
    services.value = result.data
      .filter((service: any) => service.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order);
  }

  loading.value = false;
};

// Handle service card click
const openService = (service: any) => {
  emit("open-service", service);
};

// Load on mount
onMounted(() => {
  loadServices();
});
</script>

<template>
  <section id="custom" class="bg-cream py-16">
    <div class="container mx-auto max-w-7xl px-4">
      <div class="mb-8 text-center reveal-up">
        <h2 class="section-title text-maroon">Layanan Custom</h2>
        <p class="mt-3 text-neutral-600">Kami melayani pembuatan perhiasan sesuai keinginan Anda.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-neutral-600">Memuat layanan...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!services.length" class="text-center py-12">
        <p class="text-neutral-600">Belum ada layanan custom tersedia.</p>
      </div>

      <!-- Cards -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <article
          v-for="service in services"
          :key="service.id"
          class="group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/5]"
          @click="openService(service)"
        >
          <div class="relative h-full">
            <!-- Use image_url from database or fallback to icon -->
            <img
              v-if="service.image_url"
              :src="service.image_url"
              :alt="service.title"
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="absolute inset-0 bg-gradient-to-br from-maroon to-gold flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-16 h-16 text-white opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div class="absolute inset-0 flex items-end p-4">
              <div>
                <h3 class="font-serif text-white text-lg md:text-xl drop-shadow">{{ service.title }}</h3>
                <span class="text-white/90 text-xs">Lihat Contoh Produk</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
