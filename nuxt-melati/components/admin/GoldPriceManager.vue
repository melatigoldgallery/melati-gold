<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Pengaturan Harga Emas</h2>
        <p class="text-sm text-gray-600 mt-1">Update harga per gram untuk setiap kadar emas</p>
      </div>
      <button
        @click="showHistory = !showHistory"
        class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
      >
        <i class="bi bi-clock-history mr-2"></i>
        {{ showHistory ? "Tutup History" : "Lihat History" }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Memuat data...</p>
    </div>

    <!-- Gold Price Settings -->
    <div v-else-if="!showHistory" class="space-y-4">
      <div v-for="price in goldPrices" :key="price.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ price.karat }}</h3>
            <p class="text-sm text-gray-500">Harga per gram</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ affectedCounts[price.karat] || 0 }} produk akan terupdate otomatis
            </p>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <div class="flex-1 sm:flex-none">
              <input
                v-model.number="price.price_per_gram"
                type="number"
                step="1000"
                min="0"
                class="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <span class="text-sm text-gray-600 whitespace-nowrap">/ gram</span>
            <button
              @click="updatePrice(price)"
              :disabled="saving === price.karat"
              class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {{ saving === price.karat ? "..." : "Simpan" }}
            </button>
          </div>
        </div>

        <!-- Last Update Info -->
        <div v-if="price.updated_at" class="mt-2 text-xs text-gray-400">
          Terakhir update: {{ formatDate(price.updated_at) }}
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="border-t pt-6 mt-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2">Recalculate Semua Harga Produk</h3>
          <p class="text-sm text-gray-600 mb-4">
            Akan mengupdate harga semua produk yang tidak di-override manual berdasarkan harga emas terbaru.
          </p>
          <button
            @click="recalculateAll"
            :disabled="recalculating"
            class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <i class="bi bi-calculator mr-2"></i>
            {{ recalculating ? "Menghitung ulang..." : "Recalculate Semua" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Price History -->
    <div v-else class="space-y-4">
      <div class="border rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kadar</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Lama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Baru</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perubahan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oleh</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in priceHistory" :key="record.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ record.karat }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatPrice(record.old_price) }}</td>
              <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ formatPrice(record.new_price) }}</td>
              <td class="px-4 py-3 text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    record.new_price > record.old_price ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                  ]"
                >
                  {{ record.new_price > record.old_price ? "+" : "" }}
                  {{ formatPrice(record.new_price - record.old_price) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(record.changed_at) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ record.admin_users?.full_name || "-" }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="priceHistory.length === 0" class="text-center py-8 text-gray-500">
          <i class="bi bi-inbox text-3xl mb-2"></i>
          <p>Belum ada riwayat perubahan harga</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getGoldPrices, updateGoldPrice, recalculateAllPrices, getAffectedProductsCount, getPriceHistory } =
  useGoldPricing();

// State
const goldPrices = ref<any[]>([]);
const priceHistory = ref<any[]>([]);
const affectedCounts = ref<Record<string, number>>({});
const loading = ref(true);
const saving = ref<string | null>(null);
const recalculating = ref(false);
const showHistory = ref(false);

// Load data
const loadGoldPrices = async () => {
  loading.value = true;
  const result = await getGoldPrices();
  if (result.success) {
    goldPrices.value = result.data;

    // Load affected counts for each karat
    for (const price of result.data) {
      const countResult = await getAffectedProductsCount(price.karat);
      if (countResult.success) {
        affectedCounts.value[price.karat] = countResult.count;
      }
    }
  }
  loading.value = false;
};

const loadPriceHistory = async () => {
  const result = await getPriceHistory();
  if (result.success) {
    priceHistory.value = result.data;
  }
};

// Update single price
const updatePrice = async (price: any) => {
  if (!confirm(`Update harga ${price.karat} menjadi Rp ${price.price_per_gram.toLocaleString()}/gram?`)) return;

  saving.value = price.karat;
  const result = await updateGoldPrice(price.karat, price.price_per_gram);

  if (result.success) {
    alert(`Harga ${price.karat} berhasil diupdate!`);
    await loadGoldPrices();
    await loadPriceHistory();
  } else {
    alert("Gagal update harga: " + result.error);
  }

  saving.value = null;
};

// Recalculate all products
const recalculateAll = async () => {
  const totalProducts = Object.values(affectedCounts.value).reduce((sum, count) => sum + count, 0);

  if (!confirm(`Recalculate harga untuk ${totalProducts} produk?`)) return;

  recalculating.value = true;
  const result = await recalculateAllPrices();

  if (result.success) {
    alert(`Berhasil recalculate ${result.count} produk!`);
    await loadGoldPrices();
  } else {
    alert("Gagal recalculate: " + result.error);
  }

  recalculating.value = false;
};

// Format helpers
const formatPrice = (price: number) => {
  if (!price) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Watch history toggle
watch(showHistory, (show) => {
  if (show) loadPriceHistory();
});

// Initialize
onMounted(() => {
  loadGoldPrices();
});
</script>
