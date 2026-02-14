// Nuxt config for Melati Gold Gallery
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-10-26",

  // 🚀 nonaktifkan SSR supaya build jadi static site
  ssr: false,

  // Static site generation
  nitro: {
    preset: "static",
    output: {
      dir: "dist",
      publicDir: "dist",
    },
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
        // 🎨 Favicon - menggunakan logo.png
        { rel: "icon", type: "image/png", href: "/img/logo.png" },
        { rel: "apple-touch-icon", href: "/img/logo.png" },

        // 🚀 Preconnect to external resources
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "preconnect", href: "https://cdn.jsdelivr.net" },

        // 📝 Google Fonts
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Allura&family=Poppins:wght@300;400;500;600;700&display=swap",
        },

        // ⚡ Bootstrap Icons - Preload CSS only
        {
          rel: "preload",
          as: "style",
          href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
        },
        // ✅ Bootstrap Icons stylesheet
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
