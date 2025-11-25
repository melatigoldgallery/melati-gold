<template>
  <section id="tentang" class="bg-cream py-10 md:py-16">
    <div class="container">
      <div class="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <!-- Content -->
        <div class="reveal-right">
          <h2 class="section-title tracking-tight leading-tight text-center lg:text-left">
            Tentang Melati Gold
          </h2>

          <div class="mb-3 flex justify-center lg:justify-start">
            <span
              class="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-maroon text-sm font-medium tracking-wide"
            >
              Sejak 1983
            </span>
          </div>
          <p class="mt-6 mx-3 text-neutral-700 text-base md:text-lg leading-relaxed text-justify">
            Melati Gold Shop telah menjadi destinasi terpercaya bagi para pecinta perhiasan emas di
            Bali sejak tahun 1983. Dengan lebih dari empat dekade pengalaman, kami terus berkembang
            dan berinovasi dalam menyajikan koleksi perhiasan berkualitas dengan desain modern.
          </p>
          <p class="mt-4 mx-3 text-neutral-700 text-base md:text-lg leading-relaxed text-justify">
            Berlokasi di Jalan Diponegoro No. 116, Denpasar, toko kami yang ketiga ini dibuka pada
            tahun 2018 sebagai komitmen kami untuk memberikan layanan terbaik kepada pelanggan
            setia. Kami bangga menjadi mitra dari berbagai pabrik emas ternama dan menyediakan logam
            mulia dengan standar internasional.
          </p>

          <!-- Features List -->
          <ul class="mt-8 space-y-4">
            <li class="flex items-start gap-4 group">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center group-hover:bg-gold/25 transition-colors"
              >
                <i class="bi bi-check-circle-fill text-gold text-lg"></i>
              </div>
              <div class="flex-1 pt-1.5">
                <span class="text-neutral-800 font-medium"
                  >Kemitraan dengan pabrik emas terpercaya</span
                >
                <p class="text-sm text-neutral-600 mt-0.5">Jaminan kualitas dan keaslian produk</p>
              </div>
            </li>
            <li class="flex items-start gap-4 group">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center group-hover:bg-gold/25 transition-colors"
              >
                <i class="bi bi-check-circle-fill text-gold text-lg"></i>
              </div>
              <div class="flex-1 pt-1.5">
                <span class="text-neutral-800 font-medium">Pelayanan personal dan profesional</span>
                <p class="text-sm text-neutral-600 mt-0.5">
                  Pengalaman berbelanja yang berkesan dan memuaskan
                </p>
              </div>
            </li>
            <li class="flex items-start gap-4 group">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center group-hover:bg-gold/25 transition-colors"
              >
                <i class="bi bi-check-circle-fill text-gold text-lg"></i>
              </div>
              <div class="flex-1 pt-1.5">
                <span class="text-neutral-800 font-medium">Koleksi terbaru yang selalu update</span>
                <p class="text-sm text-neutral-600 mt-0.5">Mengikuti tren perhiasan terkini</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Images -->
        <div class="relative reveal-up order-first lg:order-last">
          <!-- Mobile: Logo -->
          <div class="lg:hidden flex justify-center items-center py-0">
            <img src="/img/logo.png" alt="Logo Melati Gold" class="w-48 h-auto object-contain" />
          </div>

          <!-- Desktop: Background Images -->
          <div class="hidden lg:block relative">
            <img
              src="/img/bg2.png"
              alt="Melati Gold Shop - Toko Perhiasan Emas Bali"
              class="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-black/10 transition-transform duration-500 hover:scale-[1.02]"
            />
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-t from-maroon/20 via-transparent to-transparent"
            ></div>
          </div>
          <img
            src="/img/bg.png"
            alt="Koleksi Perhiasan Melati Gold"
            class="absolute -bottom-8 -left-8 hidden lg:block h-40 w-56 rounded-xl object-cover shadow-xl ring-2 ring-white transition-transform duration-500 hover:scale-105 hover:-translate-y-1"
          />
        </div>
      </div>
    </div>
  </section>
</template>
