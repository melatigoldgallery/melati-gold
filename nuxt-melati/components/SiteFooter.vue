<template>
  <footer id="kontak" class="relative text-white bg-gradient-to-b from-black via-[#1a0f12] to-black">
    <!-- Decorative gold line -->
    <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-black to-transparent"></div>

    <div class="container mx-auto max-w-7xl px-4">
      <!-- Main Footer Content -->
      <div class="grid gap-12 py-16 md:grid-cols-3 border-b border-gold/20">
        <!-- Brand + Hours -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <!-- Logo/Icon -->
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-maroon to-black flex items-center justify-center shadow-lg ring-1 ring-gold/30"
            >
              <img src="/img/logo.png" alt="Melati Gold" class="h-10 w-10 object-contain" />
            </div>
            <span class="font-serif text-2xl font-bold tracking-wide text-gold">Melati Gold Shop</span>
          </div>
          <p class="text-white/90 font-medium mb-2">Premium Gold Jewelry</p>
          <div class="flex items-center gap-2 text-white/80">
            <i class="bi bi-clock text-gold"></i>
            <span class="text-sm">Buka Setiap Hari</span>
          </div>
          <p class="text-white/80 text-sm mt-1">09.00 - 21.00 WITA</p>
        </div>

        <!-- Address & Contact -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 class="font-serif font-semibold text-gold text-lg mb-4 flex items-center gap-2">
            <i class="bi bi-geo-alt-fill"></i>
            Lokasi & Kontak
          </h3>
          <div class="space-y-3 text-white/80">
            <p class="flex items-start gap-2 text-left">
              <i class="bi bi-building text-gold mt-1 flex-shrink-0"></i>
              <span>
                Jl. Diponegoro No.116, Dauh Puri,
                <br />
                Denpasar, Bali 80232
              </span>
            </p>
            <p class="flex items-center gap-2">
              <i class="bi bi-telephone-fill text-gold"></i>
              <a href="tel:03612096147" class="hover:text-gold transition-colors">0361 2096147</a>
            </p>
            <p class="flex items-center gap-2">
              <i class="bi bi-whatsapp text-gold"></i>
              <a href="https://wa.me/6281237846320" target="_blank" class="hover:text-gold transition-colors">
                +62 812-3784-6320
              </a>
            </p>
          </div>
        </div>

        <!-- Social Media -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 class="font-serif font-semibold text-gold text-lg mb-4 flex items-center gap-2">
            <i class="bi bi-share-fill"></i>
            Ikuti Kami
          </h3>
          <p class="text-white/80 text-sm mb-4">Dapatkan update produk terbaru</p>
          <div class="flex gap-3">
            <a
              href="https://instagram.com/melatigoldshopbali"
              target="_blank"
              aria-label="Instagram"
              class="group w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 hover:from-gold hover:to-yellow-600 transition-all duration-300"
            >
              <i class="bi bi-instagram text-gold group-hover:text-white transition-colors"></i>
            </a>
            <a
              href="https://tiktok.com/@flowshopbali"
              target="_blank"
              aria-label="TikTok"
              class="group w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 hover:from-gold hover:to-yellow-600 transition-all duration-300"
            >
              <i class="bi bi-tiktok text-gold group-hover:text-white transition-colors"></i>
            </a>
            <!-- <a
              href="https://facebook.com/melatigoldshop"
              target="_blank"
              aria-label="Facebook"
              class="group w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 hover:from-gold hover:to-yellow-600 transition-all duration-300"
            >
              <i class="bi bi-facebook text-gold group-hover:text-white transition-colors"></i>
            </a> -->
            <a
              href="https://wa.me/6281237846320"
              target="_blank"
              aria-label="WhatsApp"
              class="group w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 hover:from-gold hover:to-yellow-600 transition-all duration-300"
            >
              <i class="bi bi-whatsapp text-gold group-hover:text-white transition-colors"></i>
            </a>
          </div>

          <!-- Trust Badges -->
          <div class="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-gold/20">
              <i class="bi bi-shield-check text-gold text-sm"></i>
              <span class="text-xs text-white/80">Emas Asli</span>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-gold/20">
              <i class="bi bi-award text-gold text-sm"></i>
              <span class="text-xs text-white/80">Terpercaya</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="py-6 flex flex-col md:flex-row items-center justify-center gap-4">
        <div class="text-center md:text-left">
          <p class="text-white/80 text-sm">
            &copy; {{ new Date().getFullYear() }}
            <span class="text-gold font-semibold">Melati Gold Shop</span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
