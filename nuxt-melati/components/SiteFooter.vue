<template>
  <footer id="kontak" class="relative text-white bg-gradient-to-b from-maroon to-black">
    <!-- soft fade from previous cream section into footer -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-cream to-transparent"></div>

    <div class="container mx-auto max-w-6xl px-4">
      <div class="grid gap-10 py-12 md:grid-cols-3">
        <!-- Brand + hours -->
        <div>
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full bg-gold/90 ring-2 ring-gold/50 grid place-items-center text-maroon font-black"
            >
              M
            </div>
            <span class="font-serif text-xl tracking-wide">Melati Gold</span>
          </div>
          <p class="mt-3 text-white/80">Open Every Day | 09.30 - 21.00</p>
        </div>

        <!-- Address -->
        <div>
          <h3 class="font-semibold text-gold">Alamat</h3>
          <p class="mt-2 text-white/80">
            Jl. Diponegoro No.116, Dauh Puri,
            <br />
            Denpasar, Bali 80232
          </p>
          <p class="mt-2 text-white/80">Phone: 03612096147</p>
        </div>

        <!-- Socials -->
        <div>
          <h3 class="font-semibold text-gold">Sosial Media</h3>
          <div class="mt-3 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition"
            >
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a
              href="#"
              aria-label="TikTok"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition"
            >
              <i class="fa-brands fa-tiktok"></i>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition"
            >
              <i class="fa-brands fa-facebook"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- subtle gold divider -->
      <div class="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

      <div class="py-4 text-center text-sm text-white/80">
        &copy; {{ new Date().getFullYear() }} Melati Gold Gallery
      </div>
    </div>
  </footer>
</template>
