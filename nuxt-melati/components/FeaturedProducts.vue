<script setup lang="ts">
import type { Product } from "~/types/product";

// Placeholder data; wire to Supabase later via useProducts()
const products = ref<Product[]>([
  { id: "1", name: "Cincin Berlian", price: 4500000, image: "/img/ring.jpg", karat: "17K", best: true as any },
  { id: "2", name: "Anting Elegan", price: 2800000, image: "/img/earrings1.jpg", karat: "16K", best: false as any },
  { id: "3", name: "Kalung Mewah", price: 5200000, image: "/img/necklace.jpg", karat: "17K", best: true as any },
  { id: "4", name: "Gelang Rantai", price: 3200000, image: "/img/bracelet3.jpg", karat: "16K", best: false as any },
  { id: "5", name: "Couple Ring", price: 3800000, image: "/img/couplering.jpg", karat: "16K", best: true as any },
  { id: "6", name: "Kalung Elegan", price: 4100000, image: "/img/necklace2.jpg", karat: "17K", best: false as any },
  { id: "7", name: "Gelang Bangle", price: 2950000, image: "/img/bangle1.jpg", karat: "16K", best: true as any },
  { id: "8", name: "Liontin Classic", price: 2100000, image: "/img/pandent.jpg", karat: "16K", best: true as any },
]);

const filter = ref<"all" | "best">("all");
const filtered = computed(() =>
  filter.value === "all" ? products.value : products.value.filter((p) => (p as any).best)
);
</script>

<template>
  <section id="produk" class="container py-20">
    <div class="mx-auto mb-6 text-center max-w-2xl reveal-in">
      <h2 class="section-title">Produk Unggulan</h2>
      <p class="mt-2 text-neutral-600">Koleksi favorit pilihan pelanggan, siap memancarkan pesonamu.</p>
    </div>
    <div class="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2 overflow-x-auto px-2">
      <button class="chip" :class="filter === 'all' ? 'ring-1 ring-gold bg-gold/15' : ''" @click="filter = 'all'">
        Semua
      </button>
      <button class="chip" :class="filter === 'best' ? 'ring-1 ring-gold bg-gold/15' : ''" @click="filter = 'best'">
        Best Seller
      </button>
    </div>

    <div class="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <article
        v-for="p in filtered"
        :key="p.id"
        class="glass overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-elegant reveal-up"
      >
        <div class="relative">
          <img :src="p.image" :alt="p.name" loading="lazy" class="h-56 w-full object-cover" />
          <span class="chip absolute left-3 top-3">{{ p.karat }}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-maroon">{{ p.name }}</h3>
          <p class="text-sm text-neutral-600">Yellow Gold</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="font-semibold text-gold">Rp {{ p.price.toLocaleString("id-ID") }}</span>
            <button class="btn-outline text-sm">Detail</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
