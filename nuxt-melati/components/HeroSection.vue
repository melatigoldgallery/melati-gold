<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-maroon to-maroon/95 text-white">
    <div class="absolute inset-0 opacity-10" aria-hidden="true">
      <div class="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-gold blur-3xl" />
      <div class="absolute right-0 -top-24 h-96 w-96 rounded-full bg-gold/60 blur-3xl" />
    </div>
    <div class="container relative z-10 mx-auto grid max-w-6xl gap-10 py-20 md:grid-cols-2 md:items-center">
      <div class="space-y-6 reveal-up">
        <span class="chip">Koleksi Baru</span>
        <h1 class="font-serif text-4xl md:text-6xl leading-tight">
          <span class="text-gradient">Kilau Elegan</span>, Pesona Abadi
        </h1>
        <p class="text-white/90 max-w-prose">
          Perhiasan emas premium dengan desain eksklusif. Percayakan kilauanmu pada koleksi terbaik dari Melati Gold.
        </p>
        <div class="flex gap-3">
          <a href="#produk" class="btn-primary">Lihat Koleksi</a>
          <a href="#tentang" class="btn-outline">Tentang Kami</a>
        </div>
      </div>
      <div class="relative reveal-right">
        <img
          src="/img/necklace-cvr.jpg"
          alt="Melati Gold Hero"
          class="mx-auto aspect-[4/3] w-full max-w-xl rounded-2xl object-cover ring-1 ring-white/10 shadow-2xl"
        />
        <div class="absolute -bottom-6 -left-6 hidden md:block">
          <img src="/img/earringcvr.jpg" class="h-28 w-40 rounded-xl object-cover ring-1 ring-white/20 shadow-lg" alt="Earring" />
        </div>
        <div class="pointer-events-none absolute -right-8 -top-8 hidden aspect-square w-40 rounded-full border border-gold/40 md:block" />
      </div>
    </div>
  </section>
</template>
