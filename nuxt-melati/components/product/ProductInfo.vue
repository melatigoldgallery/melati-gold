<script setup lang="ts">
import { computed, ref } from "vue";
import {
  InformationCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  CheckIcon,
  ShareIcon,
} from "@heroicons/vue/24/outline";

const { addToast } = useToast();

const props = defineProps<{
  product: any;
}>();

// Format price
const formatPrice = (price: number) => {
  if (!price) return "Hubungi Kami";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Product specs
const specs = computed(() => {
  const result: Array<{ label: string; value: string }> = [];

  if (props.product?.karat) {
    result.push({ label: "Karat", value: props.product.karat });
  }
  if (props.product?.weight) {
    result.push({ label: "Berat", value: `Mulai dari ${props.product.weight}` });
  }
  if (props.product?.stone_type) {
    result.push({ label: "Jenis Batu", value: props.product.stone_type });
  }
  if (props.product?.size) {
    result.push({ label: "Ukuran", value: props.product.size });
  }

  // Additional specs from product.specs array
  if (props.product?.specs && Array.isArray(props.product.specs)) {
    props.product.specs.forEach((spec: any) => {
      if (spec.label && spec.value) {
        result.push({ label: spec.label, value: spec.value });
      }
    });
  }

  return result;
});

// No longer need these handlers - handled by ProductContactButtons

// Share / Copy link
const copied = ref(false);

const shareProduct = async () => {
  const url = window.location.href;
  const title = props.product?.title || props.product?.name || "Produk Melati Gold Shop";

  // Gunakan native share sheet jika tersedia (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch {
      // User membatalkan share — tidak perlu toast
    }
    return;
  }

  // Fallback: copy ke clipboard (desktop)
  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    addToast("Link berhasil disalin!", "success", 2500);
    setTimeout(() => (copied.value = false), 2500);
  } catch {
    addToast("Gagal menyalin link.", "error");
  }
};
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Product Title & Category -->
    <div>
      <div
        v-if="product?.category_name"
        class="text-xs sm:text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide"
      >
        {{ product.category_name }}
        <span v-if="product?.subcategory_name" class="text-gold">/ {{ product.subcategory_name }}</span>
      </div>
      <div class="flex items-start justify-between gap-3">
        <h1 class="font-bold text-xl sm:text-2xl lg:text-2xl font-serif text-gray-900 leading-tight">
          {{ product?.title || product?.name || "Loading..." }}
        </h1>
        <!-- Tombol Share / Copy Link -->
        <button
          @click="shareProduct"
          :title="copied ? 'Link disalin!' : 'Bagikan produk ini'"
          class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 mt-0.5"
          :class="
            copied
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-gray-300 bg-white text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50'
          "
        >
          <CheckIcon v-if="copied" class="w-3.5 h-3.5" />
          <ShareIcon v-else class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ copied ? "Disalin!" : "Bagikan" }}</span>
        </button>
      </div>
    </div>

    <!-- Price -->
    <div class="border-t border-b border-gray-200 py-3 md:py-4 bg-gradient-to-r from-amber-50/50 to-transparent">
      <div class="text-xl sm:text-2xl lg:text-xl font-bold text-maroon">
        Mulai dari {{ formatPrice(product?.price) }}
      </div>
      <p v-if="product?.price" class="text-xs sm:text-sm text-gray-600 mt-1.5 flex items-center gap-1">
        <InformationCircleIcon class="w-4 h-4" />
        <span>Harga menyesuaikan dengan berat yang tersedia dan harga emas terbaru</span>
      </p>
    </div>

    <!-- Description -->
    <div v-if="product?.description" class="prose prose-sm max-w-none">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <DocumentTextIcon class="w-5 h-5 text-maroon" />
        <span>Deskripsi</span>
      </h3>
      <p class="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">{{ product.description }}</p>
    </div>

    <!-- Specifications -->
    <div
      v-if="specs.length > 0"
      class="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 md:p-5 border border-gray-200"
    >
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ClipboardDocumentCheckIcon class="w-5 h-5 text-maroon" />
        <span>Spesifikasi</span>
      </h3>
      <dl class="space-y-1.5">
        <div
          v-for="(spec, index) in specs"
          :key="index"
          class="flex justify-between items-center py-1 border-b border-gray-200 last:border-0 gap-2"
        >
          <dt class="text-sm sm:text-base text-gray-600 font-medium flex items-center gap-2">
            <span class="text-maroon text-xl leading-none">•</span>
            {{ spec.label }}
          </dt>
          <dd class="text-sm sm:text-base text-gray-900 font-semibold text-right">{{ spec.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- CTA Buttons (Shopee, Tokopedia, WhatsApp) -->
    <div class="pt-2">
      <ProductContactButtons :product="product" />
    </div>

    <!-- Additional Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4 text-xs sm:text-sm text-blue-900">
      <div class="flex gap-2 md:gap-3">
        <ShieldCheckIcon class="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div class="space-y-1.5">
          <p class="font-semibold text-sm sm:text-base">Jaminan Kualitas</p>
          <ul class="space-y-1 text-blue-800">
            <li class="flex items-start gap-2">
              <CheckIcon class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Semua produk dijamin keasliannya dengan sertifikat</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckIcon class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Menerima jual dan tukar tambah emas</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckIcon class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Bisa custom perhiasan sesuai model yang diinginkan</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
