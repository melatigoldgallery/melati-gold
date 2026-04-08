<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import type { OrderFilters, OrderStatus } from "~/types/order";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "~/types/order";

definePageMeta({ layout: "admin" });

const { getOrders, updateOrderStatus } = useOrderManager();
const toast = useToast();

const filters = reactive<OrderFilters>({
  status: "",
  search: "",
  page: 1,
  limit: 15,
});

const {
  data: pageData,
  status: fetchStatus,
  refresh,
} = useAsyncData(
  () => `admin-orders-${filters.status}-${filters.search}-${filters.page}`,
  () => getOrders({ ...filters }),
  { watch: [() => filters.status, () => filters.page] },
);

const orders = computed(() => pageData.value?.data ?? []);
const pagination = computed(() => pageData.value?.pagination);
const loading = computed(() => fetchStatus.value === "pending");

let searchTimer: ReturnType<typeof setTimeout>;
const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    filters.page = 1;
    refresh();
  }, 400);
};

const statusOptions: { label: string; value: OrderStatus | "" }[] = [
  { label: "Semua Status", value: "" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
    label,
    value: value as OrderStatus,
  })),
];

const updatingId = ref<string | null>(null);
const changeStatus = async (id: string, newStatus: OrderStatus) => {
  updatingId.value = id;
  const result = await updateOrderStatus(id, newStatus);
  if (result.success) {
    toast.success("Status pesanan diperbarui");
    refresh();
  } else {
    toast.error(result.error ?? "Gagal memperbarui status");
  }
  updatingId.value = null;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
</script>

<template>
  <div class="py-4 sm:py-6">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <!-- Header -->
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p class="mt-1 text-xs sm:text-sm text-gray-600">Pantau dan proses semua transaksi masuk</p>
        </div>
        <NuxtLink
          to="/dashboard"
          class="px-3 py-2 sm:px-4 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          ← Dashboard
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Cari nama, nomor HP, atau nomor order..."
          class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/30"
          @input="onSearch"
        />
        <select
          v-model="filters.status"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/30"
          @change="filters.page = 1"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="loading" class="text-center py-16 text-gray-500 text-sm">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-maroon mb-3"></div>
          <p>Memuat pesanan...</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-16 text-gray-400">
          <ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-3" />
          <p class="text-sm">Tidak ada pesanan ditemukan</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left font-semibold text-gray-700">No. Order</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Pelanggan</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-mono text-xs font-semibold text-maroon">
                  {{ order.order_number }}
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">{{ order.customer_name }}</div>
                  <div class="text-gray-500 text-xs">{{ order.customer_phone }}</div>
                </td>
                <td class="px-4 py-3 font-semibold text-gray-900">
                  {{ formatCurrency(order.total_amount) }}
                </td>
                <td class="px-4 py-3">
                  <span
                    :class="ORDER_STATUS_COLORS[order.status as OrderStatus]"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ ORDER_STATUS_LABELS[order.status as OrderStatus] }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <NuxtLink
                      :to="ROUTES.ADMIN.ORDER_DETAIL(order.id)"
                      class="px-2 py-1 text-xs bg-maroon text-white rounded hover:bg-maroon/90 transition-colors"
                    >
                      Detail
                    </NuxtLink>
                    <button
                      v-if="order.status === 'pending'"
                      :disabled="updatingId === order.id"
                      class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                      @click="changeStatus(order.id, 'paid')"
                    >
                      Tandai Bayar
                    </button>
                    <button
                      v-if="order.status === 'paid'"
                      :disabled="updatingId === order.id"
                      class="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                      @click="changeStatus(order.id, 'processing')"
                    >
                      Proses
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="border-t border-gray-100 p-4">
          <AppPagination
            :current-page="filters.page"
            :total-pages="pagination.totalPages"
            :total-items="pagination.total"
            :items-per-page="filters.limit"
            @page-change="filters.page = $event"
          />
        </div>
      </div>
    </div>
  </div>
</template>
