<template>
  <section id="tentang" class="bg-cream py-10 md:py-14">
    <div class="container">
      <div class="max-w-4xl mx-auto">
        <!-- Logo Desktop & Mobile -->
        <div class="flex justify-center items-center mb-6 reveal-up">
          <img src="/img/logo.png" alt="Logo Melati Gold" class="w-44 lg:w-54 h-auto object-contain" />
        </div>

        <!-- Title -->
        <div class="reveal-up">
          <h2 class="section-title tracking-tight leading-tight text-center">Tentang Melati Gold Shop</h2>

          <div class="mb-3 flex justify-center">
            <span
              class="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-maroon text-sm font-medium tracking-wide"
            >
              Sejak 1983
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="reveal-up">
          <p class="mt-6 mx-3 text-neutral-700 text-base md:text-lg leading-relaxed text-justify indent-8">
            Melati Gold Shop telah menjadi destinasi terpercaya bagi para pecinta perhiasan emas di Bali sejak tahun
            1983. Dengan lebih dari empat dekade pengalaman, kami terus berkembang dan berinovasi dalam menyajikan
            koleksi perhiasan berkualitas dengan desain modern dan menyediakan logam mulia dengan standar internasional.
          </p>
          <p class="mt-4 mx-3 text-neutral-700 text-base md:text-lg leading-relaxed text-justify indent-8">
            Kini kami memiliki 4 cabang toko: Melati 1, Melati 2, Sakura yang berlokasi di Jalan Hasanudin Denpasar dan
            Melati 3 yang berlokasi di Jalan Diponegoro No. 116 Denpasar. Kami berkomitmen untuk terus memberikan
            pelayanan terbaik kepada pelanggan setia.
          </p>

          <!-- Features List -->
          <ul class="mt-8 space-y-4 max-w-2xl mx-0">
            <li class="flex items-start gap-4 group">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center group-hover:bg-gold/25 transition-colors"
              >
                <i class="bi bi-check-circle-fill text-gold text-lg"></i>
              </div>
              <div class="flex-1 pt-1.5">
                <span class="text-neutral-800 font-medium">Kemitraan dengan pabrik emas terpercaya</span>
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
                <p class="text-sm text-neutral-600 mt-0.5">Pengalaman berbelanja yang berkesan dan memuaskan</p>
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
      </div>

      <!-- Google Maps Location -->
      <div class="mt-12 md:mt-16 reveal-up">
        <div class="text-center mb-6 md:mb-8">
          <h3 class="text-2xl md:text-3xl font-serif text-maroon">Lokasi Kami</h3>
          <p class="mt-2 text-neutral-600">Kunjungi toko kami di Denpasar, Bali</p>
        </div>

        <div class="mx-auto max-w-4xl">
          <div class="relative overflow-hidden rounded-2xl shadow-lg border border-white/60 bg-white/90 backdrop-blur">
            <div class="aspect-[16/9] md:aspect-[21/9]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.2087471891744!2d115.21448931478415!3d-8.673689993810697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd2409b0e5e8123%3A0x5e7a1a7a1a7a1a7a!2sJl.%20Diponegoro%20No.116%2C%20Dauh%20Puri%20Klod%2C%20Kec.%20Denpasar%20Bar.%2C%20Kota%20Denpasar%2C%20Bali!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style="border: 0"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                class="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>

          <!-- Address Details -->
          <div class="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-neutral-700">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                <i class="bi bi-geo-alt-fill text-gold"></i>
              </div>
              <span class="text-sm md:text-base">Jl. Diponegoro No. 116, Denpasar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
