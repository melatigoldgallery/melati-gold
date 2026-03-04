<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Pengaturan Harga Emas</h2>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Kelola harga per gram untuk setiap kadar emas</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showAddForm = !showAddForm"
          class="flex items-center gap-1.5 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <i :class="showAddForm ? 'bi-x-lg' : 'bi-plus-lg'" class="text-xs"></i>
          <span>{{ showAddForm ? "Batal" : "Tambah Kadar" }}</span>
        </button>
        <button
          @click="toggleHistory"
          :class="[
            'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium border',
            showHistory
              ? 'bg-gray-700 text-white border-gray-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
          ]"
        >
          <i class="bi bi-clock-history text-xs"></i>
          <span class="hidden sm:inline">{{ showHistory ? "Tutup History" : "Lihat History" }}</span>
          <span class="sm:hidden">History</span>
        </button>
      </div>
    </div>

    <!-- Add New Karat Form -->
    <Transition name="slide-down">
      <div
        v-if="showAddForm"
        class="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 sm:p-5 shadow-sm"
      >
        <h3 class="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
          <i class="bi bi-plus-circle-fill"></i>
          Tambah Kadar Emas Baru
        </h3>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 sm:max-w-[160px]">
            <label class="block text-xs font-medium text-gray-600 mb-1">Nama Kadar</label>
            <input
              v-model="newKarat.karat"
              type="text"
              placeholder="cth: 24K, 10K"
              maxlength="10"
              class="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white uppercase"
              @input="(e: Event) => (newKarat.karat = (e.target as HTMLInputElement).value.toUpperCase())"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">Harga per Gram (Rp)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
              <input
                v-model.number="newKarat.price_per_gram"
                type="number"
                step="1000"
                min="1"
                placeholder="0"
                class="w-full border border-yellow-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
              />
            </div>
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="handleAddKarat"
              :disabled="adding || !newKarat.karat || !newKarat.price_per_gram"
              class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              <span
                v-if="adding"
                class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <i v-else class="bi bi-check-lg"></i>
              {{ adding ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
        <p v-if="addError" class="mt-2 text-xs text-red-600 flex items-center gap-1">
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ addError }}
        </p>
      </div>
    </Transition>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="w-8 h-8 border-[3px] border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-500">Memuat data harga...</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Gold Price List -->
      <div v-if="!showHistory">
        <!-- Stats Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div class="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm text-center">
            <p class="text-2xl sm:text-3xl font-bold text-yellow-600">{{ goldPrices.length }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Kadar Aktif</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm text-center">
            <p class="text-2xl sm:text-3xl font-bold text-blue-600">{{ totalAffected }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Produk Terkelola</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm text-center">
            <p class="text-lg sm:text-xl font-bold text-green-600 leading-tight">{{ formatPriceShort(minPrice) }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Harga Terendah</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm text-center">
            <p class="text-lg sm:text-xl font-bold text-orange-600 leading-tight">{{ formatPriceShort(maxPrice) }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Harga Tertinggi</p>
          </div>
        </div>

        <!-- Price Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          <div
            v-for="price in goldPrices"
            :key="price.id"
            class="group bg-white border border-gray-200 rounded-xl p-4 hover:border-yellow-300 hover:shadow-md transition-all duration-200"
          >
            <!-- Card Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm"
                >
                  <i class="bi bi-currency-dollar text-white text-sm"></i>
                </div>
                <div>
                  <span class="font-bold text-gray-900 text-base">{{ price.karat }}</span>
                  <p class="text-[10px] text-gray-400 leading-none mt-0.5">
                    {{ affectedCounts[price.karat] ?? 0 }} produk
                  </p>
                </div>
              </div>
              <button
                @click="confirmDelete(price)"
                :disabled="deleting === price.karat"
                class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Nonaktifkan kadar"
              >
                <span
                  v-if="deleting === price.karat"
                  class="inline-block w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"
                ></span>
                <i v-else class="bi bi-trash3 text-sm"></i>
              </button>
            </div>

            <!-- Price Input -->
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rp</span>
                <input
                  v-model.number="price.price_per_gram"
                  type="number"
                  step="1000"
                  min="0"
                  class="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <span class="text-xs text-gray-400 whitespace-nowrap shrink-0">/gram</span>
              <button
                @click="updatePrice(price)"
                :disabled="saving === price.karat"
                class="shrink-0 flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg transition-colors text-xs font-medium"
              >
                <span
                  v-if="saving === price.karat"
                  class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                <i v-else class="bi bi-check-lg"></i>
                {{ saving === price.karat ? "..." : "Simpan" }}
              </button>
            </div>

            <!-- Last Update -->
            <p v-if="price.updated_at" class="mt-2 text-[10px] text-gray-400">
              Diperbarui: {{ formatDate(price.updated_at) }}
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="goldPrices.length === 0" class="text-center py-16 text-gray-400">
          <i class="bi bi-coin text-4xl block mb-2"></i>
          <p class="text-sm">Belum ada kadar emas. Klik "Tambah Kadar" untuk memulai.</p>
        </div>

        <!-- Recalculate Section -->
        <div class="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <i class="bi bi-calculator-fill text-yellow-600"></i>
                Recalculate Semua Harga Produk
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Update otomatis harga
                <span class="font-medium text-gray-700">{{ totalAffected }} produk</span>
                berdasarkan harga emas terbaru (kecuali yang di-override manual).
              </p>
            </div>
            <button
              @click="recalculateAll"
              :disabled="recalculating || totalAffected === 0"
              class="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <span
                v-if="recalculating"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <i v-else class="bi bi-arrow-repeat"></i>
              {{ recalculating ? "Menghitung ulang..." : "Recalculate Sekarang" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Price History -->
      <div v-else>
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <i class="bi bi-clock-history text-gray-400"></i>
              Riwayat Perubahan Harga
            </span>
            <span class="text-xs text-gray-400">{{ priceHistory.length }} entri terbaru</span>
          </div>

          <!-- Table (desktop) -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kadar</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Harga Lama
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Harga Baru
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Selisih
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Oleh</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="record in priceHistory" :key="record.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
                    >
                      {{ record.karat }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ formatPrice(record.old_price) }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-900">{{ formatPrice(record.new_price) }}</td>
                  <td class="px-4 py-3">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        record.new_price > record.old_price ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                      ]"
                    >
                      <i
                        :class="record.new_price > record.old_price ? 'bi-arrow-up' : 'bi-arrow-down'"
                        class="text-[10px]"
                      ></i>
                      {{ formatPrice(Math.abs(record.new_price - record.old_price)) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(record.changed_at) }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500">{{ record.admin_users?.full_name || "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards (mobile) -->
          <div class="sm:hidden divide-y divide-gray-100">
            <div v-for="record in priceHistory" :key="record.id" class="p-4">
              <div class="flex items-center justify-between mb-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
                >
                  {{ record.karat }}
                </span>
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    record.new_price > record.old_price ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                  ]"
                >
                  <i
                    :class="record.new_price > record.old_price ? 'bi-arrow-up' : 'bi-arrow-down'"
                    class="text-[10px]"
                  ></i>
                  {{ formatPrice(Math.abs(record.new_price - record.old_price)) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-1 text-xs text-gray-500">
                <span>
                  Lama:
                  <span class="text-gray-700">{{ formatPrice(record.old_price) }}</span>
                </span>
                <span>
                  Baru:
                  <span class="font-semibold text-gray-900">{{ formatPrice(record.new_price) }}</span>
                </span>
                <span class="col-span-2">{{ formatDate(record.changed_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="priceHistory.length === 0" class="text-center py-12 text-gray-400">
            <i class="bi bi-inbox text-4xl block mb-2"></i>
            <p class="text-sm">Belum ada riwayat perubahan harga</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const {
  getGoldPrices,
  updateGoldPrice,
  recalculateAllPrices,
  getAffectedProductsCount,
  getPriceHistory,
  addGoldPrice,
  deleteGoldPrice,
} = useGoldPricing();

const emit = defineEmits<{ (e: "alert", message: string, type: "success" | "error"): void }>();

// State
const goldPrices = ref<any[]>([]);
const priceHistory = ref<any[]>([]);
const affectedCounts = ref<Record<string, number>>({});
const loading = ref(true);
const saving = ref<string | null>(null);
const deleting = ref<string | null>(null);
const adding = ref(false);
const recalculating = ref(false);
const showHistory = ref(false);
const showAddForm = ref(false);
const addError = ref("");

const newKarat = ref({ karat: "", price_per_gram: 0 });

// Computed stats
const totalAffected = computed(() => Object.values(affectedCounts.value).reduce((sum, n) => sum + n, 0));
const minPrice = computed(() =>
  goldPrices.value.length ? Math.min(...goldPrices.value.map((p) => p.price_per_gram)) : 0,
);
const maxPrice = computed(() =>
  goldPrices.value.length ? Math.max(...goldPrices.value.map((p) => p.price_per_gram)) : 0,
);

// Load data
const loadGoldPrices = async () => {
  loading.value = true;
  const result = await getGoldPrices();
  if (result.success) {
    goldPrices.value = result.data;
    for (const price of result.data) {
      const countResult = await getAffectedProductsCount(price.karat);
      if (countResult.success) affectedCounts.value[price.karat] = countResult.count;
    }
  }
  loading.value = false;
};

const loadPriceHistory = async () => {
  const result = await getPriceHistory();
  if (result.success) priceHistory.value = result.data;
};

const toggleHistory = () => {
  showHistory.value = !showHistory.value;
  if (showHistory.value) loadPriceHistory();
};

// Update single price
const updatePrice = async (price: any) => {
  if (!price.price_per_gram || price.price_per_gram <= 0) {
    emit("alert", "Harga tidak valid.", "error");
    return;
  }
  saving.value = price.karat;
  const result = await updateGoldPrice(price.karat, price.price_per_gram);
  if (result.success) {
    emit("alert", `Harga ${price.karat} berhasil diperbarui!`, "success");
    await loadGoldPrices();
    if (showHistory.value) await loadPriceHistory();
  } else {
    emit("alert", "Gagal update harga: " + result.error, "error");
  }
  saving.value = null;
};

// Add new karat
const handleAddKarat = async () => {
  addError.value = "";
  const karat = newKarat.value.karat.trim().toUpperCase();
  if (!karat) {
    addError.value = "Nama kadar tidak boleh kosong.";
    return;
  }
  if (!newKarat.value.price_per_gram || newKarat.value.price_per_gram <= 0) {
    addError.value = "Harga harus lebih dari 0.";
    return;
  }
  adding.value = true;
  const result = await addGoldPrice(karat, newKarat.value.price_per_gram);
  if (result.success) {
    emit("alert", `Kadar ${karat} berhasil ditambahkan!`, "success");
    newKarat.value = { karat: "", price_per_gram: 0 };
    showAddForm.value = false;
    await loadGoldPrices();
  } else {
    addError.value = result.error || "Gagal menambahkan kadar.";
  }
  adding.value = false;
};

// Soft-delete karat
const confirmDelete = async (price: any) => {
  const count = affectedCounts.value[price.karat] ?? 0;
  const msg =
    count > 0
      ? `Kadar ${price.karat} digunakan oleh ${count} produk. Tetap nonaktifkan?`
      : `Nonaktifkan kadar ${price.karat}?`;
  if (!confirm(msg)) return;
  deleting.value = price.karat;
  const result = await deleteGoldPrice(price.karat);
  if (result.success) {
    emit("alert", `Kadar ${price.karat} dinonaktifkan.`, "success");
    await loadGoldPrices();
  } else {
    emit("alert", "Gagal menonaktifkan: " + result.error, "error");
  }
  deleting.value = null;
};

// Recalculate all products
const recalculateAll = async () => {
  if (!confirm(`Recalculate harga untuk ${totalAffected.value} produk?`)) return;
  recalculating.value = true;
  const result = await recalculateAllPrices();
  if (result.success) {
    emit("alert", `Berhasil recalculate ${result.count} produk!`, "success");
    await loadGoldPrices();
  } else {
    emit("alert", "Gagal recalculate: " + result.error, "error");
  }
  recalculating.value = false;
};

// Format helpers
const formatPrice = (price: number) => {
  if (!price && price !== 0) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
};

const formatPriceShort = (price: number) => {
  if (!isFinite(price) || !price) return "-";
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} jt`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)} rb`;
  return price.toString();
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

onMounted(loadGoldPrices);
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
