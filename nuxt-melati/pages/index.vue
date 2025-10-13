<script setup lang="ts">
import { ref, computed } from "vue";

type Product = {
  id: number;
  name: string;
  price: string;
  description: string;
  specs: string[];
  images: string[];
};

const showSubcategoryModal = ref(false);
const showProductModal = ref(false);
const selectedCategory = ref<string | null>(null);
const selectedSubcategory = ref<string | null>(null);
const currentView = ref<"catalog" | "lookbook">("catalog");
const selectedProduct = ref<Product | null>(null);

type LookbookItem = { id: number; title: string; image: string; large?: boolean };

const lookbookData: Record<string, LookbookItem[]> = {
  fashion: [
    { id: 1, title: "Kalung Fashion 01", image: "/img/necklace.jpg", large: true },
    { id: 2, title: "Lifestyle 01", image: "/img/wedding-cover.jpg" },
    { id: 3, title: "Kalung Fashion 02", image: "/img/necklace2.jpg" },
    { id: 4, title: "Lifestyle 02", image: "/img/bg2.png" },
    { id: 5, title: "Kalung Fashion 03", image: "/img/necklace-cvr.jpg", large: true },
    { id: 6, title: "Lifestyle 03", image: "/img/menu2.jpg" },
  ],
  anak: [
    { id: 101, title: "Kalung Anak 01", image: "/img/kids-necklace.jpg", large: true },
    { id: 102, title: "Kalung Anak 02", image: "/img/kids-set.jpg" },
    { id: 103, title: "Gelang Anak", image: "/img/kids-bracelet.jpg" },
    { id: 104, title: "Cincin Anak", image: "/img/kidsring.jpg" },
    { id: 105, title: "Anting Anak", image: "/img/kidsearring.jpg", large: true },
  ],
};

const lookbookItems = computed(() => {
  return selectedSubcategory.value ? lookbookData[selectedSubcategory.value] || [] : [];
});

const products: Record<number, Product> = {
  1: {
    id: 1,
    name: "Kalung Fashion 01",
    price: "Rp 5.250.000",
    description: "Kalung fashion dengan detail elegan.",
    specs: ["Emas 18K", "Panjang 45cm", "Berat ~4.2gr"],
    images: ["/img/necklace.jpg", "/img/necklace2.jpg", "/img/necklace-cvr.jpg"],
  },
  2: {
    id: 2,
    name: "Kalung Fashion 02",
    price: "Rp 4.890.000",
    description: "Desain modern cocok untuk acara formal.",
    specs: ["Emas 18K", "Panjang 42cm", "Berat ~3.8gr"],
    images: ["/img/necklace2.jpg", "/img/necklace.jpg"],
  },
  3: {
    id: 3,
    name: "Kalung Fashion 03",
    price: "Rp 6.100.000",
    description: "Statement piece yang memukau.",
    specs: ["Emas 22K", "Panjang 46cm", "Berat ~5.0gr"],
    images: ["/img/necklace-cvr.jpg", "/img/necklace2.jpg"],
  },
  101: {
    id: 101,
    name: "Kalung Anak 01",
    price: "Rp 1.250.000",
    description: "Kalung anak ringan dan aman.",
    specs: ["Emas 10K", "Panjang 36cm", "Berat ~1.2gr"],
    images: ["/img/kids-necklace.jpg", "/img/kids-set.jpg"],
  },
  102: {
    id: 102,
    name: "Kalung Anak 02",
    price: "Rp 1.480.000",
    description: "Set kalung anak lucu.",
    specs: ["Emas 8K", "Panjang 34cm", "Berat ~1.0gr"],
    images: ["/img/kids-set.jpg", "/img/kids-necklace.jpg"],
  },
  103: {
    id: 103,
    name: "Gelang Anak",
    price: "Rp 980.000",
    description: "Gelang anak nyaman sehari-hari.",
    specs: ["Emas 8K", "Panjang 14cm", "Berat ~0.9gr"],
    images: ["/img/kids-bracelet.jpg"],
  },
  104: {
    id: 104,
    name: "Cincin Anak",
    price: "Rp 850.000",
    description: "Cincin anak imut.",
    specs: ["Emas 8K", "Ukuran 6-9", "Berat ~0.7gr"],
    images: ["/img/kidsring.jpg"],
  },
  105: {
    id: 105,
    name: "Anting Anak",
    price: "Rp 760.000",
    description: "Anting anak anti-iritasi.",
    specs: ["Emas 8K", "Berat ~0.6gr"],
    images: ["/img/kidsearring.jpg"],
  },
};

function onOpenSubcategories(category: string) {
  selectedCategory.value = category;
  showSubcategoryModal.value = true;
}

function onSelectSubcategory(key: string) {
  selectedSubcategory.value = key;
  showSubcategoryModal.value = false;
  if (selectedCategory.value === "Kalung") {
    currentView.value = "lookbook";
  }
}

function openProduct(id: number) {
  const p = products[id] || (selectedSubcategory.value === "anak" ? products[101] : products[1]);
  selectedProduct.value = p;
  showProductModal.value = true;
}

function closeProduct() {
  showProductModal.value = false;
}
</script>

<template>
  <div>
    <HeroSection v-if="currentView === 'catalog'" />
    <CatalogShowcase v-if="currentView === 'catalog'" @open-subcategories="onOpenSubcategories" />
    <FeaturedProducts v-if="currentView === 'catalog'" />
    <CustomServices v-if="currentView === 'catalog'" />
    <Testimonials v-if="currentView === 'catalog'" />
    <AboutUs v-if="currentView === 'catalog'" />
    <FinalCta v-if="currentView === 'catalog'" />

    <Transition name="fade">
      <section v-if="currentView === 'lookbook'" class="bg-cream py-5">
        <div class="container">
          <div class="text-center mb-4">
            <h2 class="section-title text-maroon">
              Lookbook — Kalung {{ selectedSubcategory === "anak" ? "Anak" : "Fashion" }}
            </h2>
            <p class="text-muted">Eksplorasi koleksi melalui tampilan majalah digital.</p>
            <button class="btn btn-outline-dark mt-2" @click="currentView = 'catalog'">Kembali ke Katalog</button>
          </div>
          <LookbookGrid :items="lookbookItems" @open="openProduct" />
        </div>
      </section>
    </Transition>

    <SubcategoryModal
      :show="showSubcategoryModal"
      :category="selectedCategory"
      @close="showSubcategoryModal = false"
      @select="onSelectSubcategory"
    />

    <ProductDetailModal :show="showProductModal" :product="selectedProduct" @close="closeProduct" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
