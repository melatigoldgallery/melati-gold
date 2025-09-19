<template>
  <footer id="kontak" class="relative bg-maroon text-white">
    <!-- soft fade from previous cream section into footer -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-cream to-transparent"></div>
    <div class="container mx-auto grid max-w-6xl gap-10 py-12 md:grid-cols-3">
      <div>
        <div class="flex items-center gap-3">
          <div
            class="h-9 w-9 rounded-full bg-gold/90 ring-2 ring-gold/50 grid place-items-center text-maroon font-black"
          >
            M
          </div>
          <span class="font-serif text-xl tracking-wide">Melati Gold</span>
        </div>
        <p class="mt-3 text-white/80">Open Every Day | 09.30 - 21.00</p>
      </div>
      <div>
        <h3 class="font-semibold">Alamat</h3>
        <p class="mt-2 text-white/80">
          Jl. Diponegoro No.116, Dauh Puri,
          <br />
          Denpasar, Bali 80232
        </p>
        <p class="mt-2 text-white/80">Phone: 03612096147</p>
      </div>
      <div>
        <h3 class="font-semibold">Sosial Media</h3>
        <div class="mt-2 flex gap-4 text-2xl">
          <a href="#" aria-label="Instagram" class="hover:text-gold"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" aria-label="TikTok" class="hover:text-gold"><i class="fa-brands fa-tiktok"></i></a>
          <a href="#" aria-label="Facebook" class="hover:text-gold"><i class="fa-brands fa-facebook"></i></a>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10 py-4 text-center text-sm">
      &copy; {{ new Date().getFullYear() }} Melati Gold Gallery
    </div>
  </footer>
</template>
