<script setup lang="ts">
import {
  ArrowLeftIcon,
  PrinterIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
} from "@heroicons/vue/24/outline";
import type { OrderStatus } from "~/types/order";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "~/types/order";

definePageMeta({ layout: "admin" });

const route = useRoute();
const orderId = computed(() => route.params.id as string);

const { getOrderById, updateOrderStatus, updateShipping } = useOrderManager();
const { printInvoice, printShippingLabel } = useInvoicePrinter();
const toast = useToast();

const {
  data: orderData,
  status: fetchStatus,
  refresh,
} = useAsyncData(
  () => `admin-order-${orderId.value}`,
  () => getOrderById(orderId.value),
  { watch: [orderId] },
);

const order = computed(() => orderData.value?.data ?? null);
const loading = computed(() => fetchStatus.value === "pending");

// --- Shipping form ---
const showShippingForm = ref(false);
const shippingForm = reactive({ tracking: "", courier: "" });
const savingShipping = ref(false);

const saveShipping = async () => {
  if (!shippingForm.tracking || !shippingForm.courier) {
    toast.error("Isi nomor resi dan nama kurir");
    return;
  }
  savingShipping.value = true;
  const result = await updateShipping(orderId.value, shippingForm.tracking, shippingForm.courier);
  if (result.success) {
    toast.success("Resi berhasil disimpan, status diubah ke Dikirim");
    showShippingForm.value = false;
    refresh();
  } else {
    toast.error(result.error ?? "Gagal menyimpan resi");
  }
  savingShipping.value = false;
};

// --- Status change ---
const updatingStatus = ref(false);
const changeStatus = async (newStatus: OrderStatus) => {
  updatingStatus.value = true;
  const result = await updateOrderStatus(orderId.value, newStatus);
  if (result.success) {
    toast.success(`Status diubah ke: ${ORDER_STATUS_LABELS[newStatus]}`);
    refresh();
  } else {
    toast.error(result.error ?? "Gagal mengubah status");
  }
  updatingStatus.value = false;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
</script>

<template>
  <div class="py-4 sm:py-6">
    <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
      <!-- Back -->
      <div class="mb-5">
        <NuxtLink
          :to="ROUTES.ADMIN.ORDERS"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-maroon transition-colors"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali ke Daftar Pesanan
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-maroon"></div>
      </div>

      <div v-else-if="!order" class="text-center py-20 text-gray-500">Pesanan tidak ditemukan.</div>

      <template v-else>
        <!-- Header Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900 font-mono">{{ order.order_number }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                :class="ORDER_STATUS_COLORS[order.status as OrderStatus]"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ ORDER_STATUS_LABELS[order.status as OrderStatus] }}
              </span>
              <!-- Status Actions -->
              <button
                v-if="order.status === 'pending'"
                :disabled="updatingStatus"
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                @click="changeStatus('paid')"
              >
                ✓ Tandai Lunas
              </button>
              <button
                v-if="order.status === 'paid'"
                :disabled="updatingStatus"
                class="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                @click="changeStatus('processing')"
              >
                ⚙ Proses Pesanan
              </button>
              <button
                v-if="order.status === 'shipped'"
                :disabled="updatingStatus"
                class="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                @click="changeStatus('completed')"
              >
                <CheckCircleIcon class="w-4 h-4 inline -mt-0.5 mr-1" />
                Selesai
              </button>
              <button
                v-if="['pending', 'paid', 'processing'].includes(order.status)"
                :disabled="updatingStatus"
                class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                @click="changeStatus('cancelled')"
              >
                <XCircleIcon class="w-4 h-4 inline -mt-0.5 mr-1" />
                Batalkan
              </button>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <!-- Customer Info -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Info Pelanggan</h3>
            <p class="font-medium">{{ order.customer_name }}</p>
            <p class="text-sm text-gray-600">{{ order.customer_phone }}</p>
            <p v-if="order.customer_address" class="text-sm text-gray-600 mt-1">
              {{ order.customer_address }}
            </p>
          </div>

          <!-- Shipping Info -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 class="font-semibold text-gray-900 mb-3">Pengiriman</h3>
            <div v-if="order.shipping_tracking_number" class="space-y-1">
              <p class="text-sm">
                <span class="text-gray-500">Kurir:</span>
                <strong>{{ order.shipping_courier }}</strong>
              </p>
              <p class="text-sm">
                <span class="text-gray-500">No. Resi:</span>
                <strong>{{ order.shipping_tracking_number }}</strong>
              </p>
            </div>
            <div v-else-if="['processing', 'paid'].includes(order.status)">
              <p class="text-sm text-gray-500 mb-2">Belum ada resi</p>
              <button
                v-if="!showShippingForm"
                class="flex items-center gap-1 px-3 py-1.5 text-xs bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
                @click="showShippingForm = true"
              >
                <TruckIcon class="w-3.5 h-3.5" />
                Input Resi
              </button>
              <div v-else class="space-y-2">
                <input
                  v-model="shippingForm.courier"
                  type="text"
                  placeholder="Nama kurir (e.g. JNE, TIKI)"
                  class="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                />
                <input
                  v-model="shippingForm.tracking"
                  type="text"
                  placeholder="Nomor resi"
                  class="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                />
                <div class="flex gap-2">
                  <button
                    :disabled="savingShipping"
                    class="px-3 py-1.5 text-xs bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50"
                    @click="saveShipping"
                  >
                    Simpan
                  </button>
                  <button
                    class="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg"
                    @click="showShippingForm = false"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400">—</p>
          </div>
        </div>

        <!-- Payment Proof -->
        <div v-if="order.payment_proof_url" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
          <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <PhotoIcon class="w-5 h-5 text-gray-500" />
            Bukti Pembayaran
          </h3>
          <a :href="order.payment_proof_url" target="_blank" rel="noopener">
            <img
              :src="order.payment_proof_url"
              alt="Bukti Pembayaran"
              class="max-h-64 rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
            />
          </a>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
          <h3 class="font-semibold text-gray-900 mb-4">Item Pesanan</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 text-left">
                  <th class="pb-2 font-semibold text-gray-600">Produk</th>
                  <th class="pb-2 font-semibold text-gray-600 text-center">Kadar</th>
                  <th class="pb-2 font-semibold text-gray-600 text-center">Qty</th>
                  <th class="pb-2 font-semibold text-gray-600 text-right">Harga</th>
                  <th class="pb-2 font-semibold text-gray-600 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="item in order.items" :key="item.id">
                  <td class="py-2 font-medium text-gray-900">{{ item.product_title }}</td>
                  <td class="py-2 text-center text-gray-600">{{ item.karat_type ?? "—" }}</td>
                  <td class="py-2 text-center text-gray-600">{{ item.quantity }}</td>
                  <td class="py-2 text-right text-gray-600">{{ formatCurrency(item.unit_price) }}</td>
                  <td class="py-2 text-right font-semibold text-gray-900">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-gray-200">
                  <td colspan="4" class="pt-3 text-right font-bold text-gray-900">Total</td>
                  <td class="pt-3 text-right font-bold text-maroon text-base">
                    {{ formatCurrency(order.total_amount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          <strong>Catatan:</strong>
          {{ order.notes }}
        </div>

        <!-- Print Actions -->
        <div class="flex flex-wrap gap-3 justify-end">
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            @click="printShippingLabel(order)"
          >
            <TruckIcon class="w-4 h-4" />
            Cetak Label
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
            @click="printInvoice(order)"
          >
            <PrinterIcon class="w-4 h-4" />
            Cetak Invoice
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
