// Nuxt config for Melati Gold Gallery
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-10-26",

  // 🚀 nonaktifkan SSR supaya build jadi static site
  ssr: false,

  // gunakan preset netlify agar output-nya siap deploy di Netlify
  nitro: {
    preset: "netlify",
  },

  // ⚡ Vite config for better HMR (Hot Module Replacement)
  vite: {
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
    },
    clearScreen: false,
  },

  // 🔄 Dev server config
  devServer: {
    port: 3000,
  },

  modules: ["@nuxtjs/tailwindcss"],

  // 🔧 Configure component auto-import for nested folders
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
    {
      path: "~/components/admin/catalog",
      pathPrefix: false,
      global: true,
    },
  ],

  app: {
    head: {
      title: "Melati Gold Gallery",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Perhiasan emas elegan dan premium" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Allura&family=Poppins:wght@300;400;500;600;700&display=swap",
        },
        // ✅ Bootstrap Icons only (used throughout the app)
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
        },
      ],
      // ✅ No scripts needed - removed Bootstrap JS (not used)
      script: [],
    },
  },

  runtimeConfig: {
    // Server-only config (private)
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    public: {
      // Client-side config (public)
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || "",
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
      cloudinaryApiKey: process.env.NUXT_PUBLIC_CLOUDINARY_API_KEY || "",
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "melati_gold_unsigned",
    },
  },

  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    viewer: false,
  },
});
