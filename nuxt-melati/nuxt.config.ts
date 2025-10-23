// Nuxt config for Melati Gold Gallery
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  // 🚀 nonaktifkan SSR supaya build jadi static site
  ssr: false,

  // gunakan preset netlify agar output-nya siap deploy di Netlify
  nitro: {
    preset: "netlify",
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
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
        },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
        },
      ],
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
          defer: true,
        },
      ],
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
