<template>
  <section id="perawatan" class="relative overflow-hidden bg-gradient-to-br from-white via-cream/70 to-white py-20">
    <div
      class="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
    ></div>
    <div class="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-maroon/10 blur-3xl"></div>

    <div class="mx-auto max-w-6xl px-4">
      <Transition name="care-fade" appear>
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-[0.4em] text-gold/80">Panduan Perawatan</p>
          <h2 class="mt-3 text-3xl md:text-4xl font-serif text-maroon">
            Bagaimana Melakukan Perawatan Emas yang Baik?
          </h2>
          <p class="mt-6 text-neutral-600 md:text-lg max-w-3xl mx-auto">
            Agar emas tetap berkilau dan awet, berikut adalah beberapa cara merawatnya.
          </p>
        </div>
      </Transition>

      <TransitionGroup name="care-card" tag="div" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(tip, index) in tips"
          :key="tip.title"
          class="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-maroon/10 backdrop-blur transition-transform duration-500 hover:-translate-y-2"
          :style="{ transitionDelay: `${index * 80}ms` }"
        >
          <div class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div class="absolute -top-16 right-0 h-40 w-40 rounded-full bg-gold/20 blur-3xl"></div>
            <div class="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-maroon/10 blur-3xl"></div>
          </div>

          <div class="relative flex items-start gap-4">
            <span class="flex h-12 w-12 items-center justify-center text-2xl text-gold">
              <i class="bi bi-gem text-xl"></i>
            </span>
            <div>
              <h3 class="text-xl font-semibold text-maroon">{{ tip.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-neutral-600">{{ tip.description }}</p>
            </div>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
const tips = [
  {
    title: "Bersihkan Secara Berkala",
    description:
      "Rendam emas dalam air hangat yang dicampur sabun lembut, sikat perlahan dengan sikat halus, kemudian bilas dan keringkan dengan kain lembut.",
  },
  {
    title: "Hindari Paparan Bahan Kimia",
    description:
      "Lepaskan perhiasan saat menggunakan parfum, hairspray, lotion, atau berenang di kolam klorin agar kilau emas tidak mudah memudar.",
  },
  {
    title: "Simpan dengan Benar",
    description:
      "Gunakan kotak atau pouch berlapis kain lembut dan simpan perhiasan secara terpisah untuk menghindari goresan dan gesekan.",
  },
  {
    title: "Hindari Aktivitas Berat",
    description:
      "Jangan kenakan perhiasan emas saat berolahraga atau melakukan pekerjaan kasar agar tidak mudah bengkok atau tergores.",
  },
  {
    title: "Periksa ke Toko Perhiasan",
    description:
      "Lakukan pengecekan rutin untuk polishing atau gold plating, serta pastikan tidak ada bagian yang longgar atau rusak.",
  },
  {
    title: "Gunakan Lap Poles Khusus",
    description:
      "Lap kain microfiber khusus perhiasan membantu menghilangkan noda dan menjaga kilau emas tanpa merusak permukaannya.",
  },
];
</script>

<style scoped>
.care-fade-enter-active,
.care-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.care-fade-enter-from,
.care-fade-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

.care-card-enter-active,
.care-card-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.care-card-enter-from,
.care-card-leave-to {
  opacity: 0;
  transform: translateY(18px);
}
</style>
