<script setup lang="ts">
import { ExclamationTriangleIcon, PlusIcon, AdjustmentsHorizontalIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import type { ProductVariant, StockChangeType } from "~/types/order";

definePageMeta({ layout: "admin" });

const { getVariantsByProduct, getLowStockVariants, adjustStock, createVariant, generateSku } = useInventoryManager();
const { getProducts } = useCatalogManager();
const toast = useToast();

// ============================================
// TAB NAVIGATION
// ============================================
const activeTab = ref<"low-stock" | "by-product">("low-stock");

// ============================================
// LOW STOCK
// ============================================
const {
  data: lowStockData,
  status: lowStockStatus,
  refresh: refreshLowStock,
} = useAsyncData("admin-inventory-low-stock", () => getLowStockVariants());

const lowStockVariants = computed(() => lowStockData.value?.data ?? []);
const loadingLow = computed(() => lowStockStatus.value === "pending");

// ============================================
// BY PRODUCT
// ============================================
const selectedProductId = ref("");
const { data: productsData } = useAsyncData("admin-inventory-products", () => getProducts({}));

const products = computed(
  () => (productsData.value?.data ?? []) as unknown as Array<{ id: string; title: string; karat?: string }>,
);

const {
  data: variantsData,
  status: variantsStatus,
  refresh: refreshVariants,
} = useAsyncData(
  () => `admin-inventory-variants-${selectedProductId.value}`,
  () =>
    selectedProductId.value
      ? getVariantsByProduct(selectedProductId.value)
      : Promise.resolve({ success: true, data: [] }),
  { watch: [selectedProductId] },
);

const variants = computed(() => variantsData.value?.data ?? []);
const loadingVariants = computed(() => variantsStatus.value === "pending");

// ============================================
// ADJUST STOCK MODAL
// ============================================
const adjustModal = reactive<{
  show: boolean;
  variant: ProductVariant | null;
  type: StockChangeType;
  qty: number;
  notes: string;
  saving: boolean;
}>({
  show: false,
  variant: null,
  type: "restock",
  qty: 1,
  notes: "",
  saving: false,
});

const openAdjust = (variant: ProductVariant, type: StockChangeType = "restock") => {
  adjustModal.variant = variant;
  adjustModal.type = type;
  adjustModal.qty = 1;
  adjustModal.notes = "";
  adjustModal.show = true;
};

const saveAdjust = async () => {
  if (!adjustModal.variant || adjustModal.qty <= 0) return;
  adjustModal.saving = true;
  const delta = ["sale", "booking"].includes(adjustModal.type) ? -Math.abs(adjustModal.qty) : Math.abs(adjustModal.qty);
  const result = await adjustStock(adjustModal.variant.id, delta, adjustModal.type, adjustModal.notes || undefined);
  if (result.success) {
    toast.success("Stok berhasil diperbarui");
    adjustModal.show = false;
    refreshLowStock();
    refreshVariants();
  } else {
    toast.error(result.error ?? "Gagal memperbarui stok");
  }
  adjustModal.saving = false;
};

// ============================================
// ADD VARIANT MODAL
// ============================================
const addModal = reactive({
  show: false,
  label: "",
  stock: 0,
  threshold: 2,
  saving: false,
});

const openAddVariant = () => {
  addModal.label = "";
  addModal.stock = 0;
  addModal.threshold = 2;
  addModal.show = true;
};

const saveNewVariant = async () => {
  if (!selectedProductId.value) return;
  addModal.saving = true;
  const product = products.value.find((p) => p.id === selectedProductId.value);
  const seq = variants.value.length + 1;
  const sku = generateSku(product?.karat ?? "XX", "GEN", seq);

  const result = await createVariant({
    product_id: selectedProductId.value,
    sku,
    variant_label: addModal.label || undefined,
    current_stock: addModal.stock,
    min_stock_threshold: addModal.threshold,
    is_active: true,
  });

  if (result.success) {
    toast.success("Varian berhasil ditambahkan");
    addModal.show = false;
    refreshVariants();
  } else {
    toast.error(result.error ?? "Gagal menambah varian");
  }
  addModal.saving = false;
};

const stockBadgeClass = (variant: ProductVariant) => {
  if (variant.current_stock === 0) return "bg-red-100 text-red-800";
  if (variant.current_stock <= variant.min_stock_threshold) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};
</script>

<template>
  <div class="py-4 sm:py-6">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <!-- Header -->
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Manajemen Inventori</h1>
          <p class="mt-1 text-xs sm:text-sm text-gray-600">Kelola stok dan varian produk</p>
        </div>
        <NuxtLink
          to="/dashboard"
          class="px-3 py-2 sm:px-4 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          ← Dashboard
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="mb-4">
        <nav class="flex space-x-2 border-b border-gray-200">
          <button
            v-for="tab in [
              { key: 'low-stock', label: 'Stok Rendah', icon: 'bi bi-exclamation-triangle' },
              { key: 'by-product', label: 'Per Produk', icon: 'bi bi-box-seam' },
            ]"
            :key="tab.key"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === tab.key
                ? 'border-maroon text-maroon'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ]"
            @click="activeTab = tab.key as typeof activeTab"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
            <span
              v-if="tab.key === 'low-stock' && lowStockVariants.length > 0"
              class="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none"
            >
              {{ lowStockVariants.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- LOW STOCK TAB -->
      <div v-if="activeTab === 'low-stock'" class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div v-if="loadingLow" class="text-center py-16 text-gray-500 text-sm">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-maroon mb-3"></div>
          <p>Memuat data stok...</p>
        </div>
        <div v-else-if="lowStockVariants.length === 0" class="text-center py-16 text-gray-400">
          <AdjustmentsHorizontalIcon class="w-12 h-12 mx-auto mb-3" />
          <p class="text-sm">Semua stok aman — tidak ada yang di bawah batas minimum</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Varian</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">Stok</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">Min</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="v in lowStockVariants" :key="v.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">
                  {{ v.product?.title ?? "—" }}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ v.sku }}</td>
                <td class="px-4 py-3 text-gray-600">{{ v.variant_label ?? "Default" }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="stockBadgeClass(v)" class="px-2 py-0.5 rounded-full text-xs font-semibold">
                    {{ v.current_stock }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ v.min_stock_threshold }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    class="flex items-center gap-1 mx-auto px-3 py-1 text-xs bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
                    @click="openAdjust(v, 'restock')"
                  >
                    <ArrowPathIcon class="w-3 h-3" />
                    Restock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BY PRODUCT TAB -->
      <div v-if="activeTab === 'by-product'">
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-end"
        >
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-600 mb-1">Pilih Produk</label>
            <select
              v-model="selectedProductId"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/30"
            >
              <option value="">-- Pilih produk --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.title }}
              </option>
            </select>
          </div>
          <button
            v-if="selectedProductId"
            class="flex items-center gap-2 px-4 py-2 text-sm bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors whitespace-nowrap"
            @click="openAddVariant"
          >
            <PlusIcon class="w-4 h-4" />
            Tambah Varian
          </button>
        </div>

        <div v-if="selectedProductId" class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div v-if="loadingVariants" class="text-center py-10 text-sm text-gray-500">
            <div class="inline-block h-7 w-7 animate-spin rounded-full border-b-2 border-maroon mb-2"></div>
            <p>Memuat varian...</p>
          </div>
          <div v-else-if="variants.length === 0" class="text-center py-10 text-gray-400 text-sm">
            <ExclamationTriangleIcon class="w-10 h-10 mx-auto mb-2" />
            <p>Belum ada varian untuk produk ini</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700">Varian</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700">Stok</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700">Dipesan</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700">Min</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="v in variants" :key="v.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ v.sku }}</td>
                  <td class="px-4 py-3 text-gray-800">{{ v.variant_label ?? "Default" }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="stockBadgeClass(v)" class="px-2 py-0.5 rounded-full text-xs font-semibold">
                      {{ v.current_stock }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center text-gray-500">{{ v.stock_booked }}</td>
                  <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ v.min_stock_threshold }}</td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        @click="openAdjust(v, 'restock')"
                      >
                        + Restock
                      </button>
                      <button
                        class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        @click="openAdjust(v, 'adjustment')"
                      >
                        Koreksi
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          v-else
          class="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400 text-sm"
        >
          Pilih produk untuk melihat daftar varian dan stoknya
        </div>
      </div>
    </div>
  </div>

  <!-- Adjust Stock Modal -->
  <Teleport to="body">
    <div
      v-if="adjustModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="adjustModal.show = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="font-bold text-gray-900 mb-1">Ubah Stok</h3>
        <p class="text-sm text-gray-500 mb-4">
          {{ adjustModal.variant?.sku }} — {{ adjustModal.variant?.variant_label ?? "Default" }}
        </p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Jenis Perubahan</label>
            <select v-model="adjustModal.type" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="restock">Restock (tambah)</option>
              <option value="adjustment">Koreksi Manual</option>
              <option value="return">Retur</option>
              <option value="sale">Penjualan Manual</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Jumlah</label>
            <input
              v-model.number="adjustModal.qty"
              type="number"
              min="1"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Catatan (opsional)</label>
            <input
              v-model="adjustModal.notes"
              type="text"
              placeholder="Alasan perubahan stok"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div class="flex gap-2 mt-5">
          <button
            :disabled="adjustModal.saving"
            class="flex-1 py-2 text-sm bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50 transition-colors"
            @click="saveAdjust"
          >
            {{ adjustModal.saving ? "Menyimpan..." : "Simpan" }}
          </button>
          <button
            class="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            @click="adjustModal.show = false"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Add Variant Modal -->
  <Teleport to="body">
    <div
      v-if="addModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="addModal.show = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="font-bold text-gray-900 mb-4">Tambah Varian Baru</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Label Varian (opsional)</label>
            <input
              v-model="addModal.label"
              type="text"
              placeholder="e.g. Ukuran 16, Rose Gold"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Stok Awal</label>
            <input
              v-model.number="addModal.stock"
              type="number"
              min="0"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Minimum Stok (alert)</label>
            <input
              v-model.number="addModal.threshold"
              type="number"
              min="1"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div class="flex gap-2 mt-5">
          <button
            :disabled="addModal.saving"
            class="flex-1 py-2 text-sm bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50 transition-colors"
            @click="saveNewVariant"
          >
            {{ addModal.saving ? "Menyimpan..." : "Tambah" }}
          </button>
          <button
            class="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            @click="addModal.show = false"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
