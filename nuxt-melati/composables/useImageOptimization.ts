/**
 * Composable untuk Image Optimization dengan Cloudinary
 * Auto-transform images: compress, resize, format optimization
 */

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb";
  gravity?: "auto" | "face" | "center";
}

export const useImageOptimization = () => {
  /**
   * Transform Cloudinary URL dengan optimization parameters
   * Contoh: https://res.cloudinary.com/demo/image/upload/v1/sample.jpg
   * Menjadi: https://res.cloudinary.com/demo/image/upload/w_400,h_400,f_auto,q_auto/v1/sample.jpg
   */
  const getOptimizedUrl = (originalUrl: string, options: CloudinaryTransformOptions = {}): string => {
    if (!originalUrl || !originalUrl.includes("cloudinary.com")) {
      return originalUrl; // Return original if not Cloudinary URL
    }

    const { width, height, quality = "auto", format = "auto", crop = "fill", gravity = "auto" } = options;

    // Build transformation string
    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    transformations.push(`f_${format}`); // Auto format (WebP jika browser support)
    transformations.push(`q_${quality}`); // Auto quality optimization

    const transformString = transformations.join(",");

    // Insert transformation into Cloudinary URL
    // Before: .../upload/v1/sample.jpg
    // After: .../upload/w_400,h_400,f_auto,q_auto/v1/sample.jpg
    return originalUrl.replace("/upload/", `/upload/${transformString}/`);
  };

  /**
   * Preset transformations — diselaraskan dengan Cloudinary Eager Transforms
   * Eager: w_400,h_533 | w_400,h_500 | w_800,h_1067
   * Semua dengan c_fill,f_auto,q_auto,g_auto
   * Setiap request akan langsung hit CDN cache tanpa transform kredit baru.
   *
   * thumbnail → alias card (w_400): browser scale down ke 80-120px tampil
   * detail    → alias gallery (w_800): cukup untuk lightbox bahkan di Retina
   */
  const presets = {
    // Alias → card (w_400,h_533): browser scale down jadi ~80-160px tampil, cukup tajam
    // Tidak perlu eager terpisah, hemat 1 upload credit per gambar
    thumbnail: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 533,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),

    // 3:4 portrait card — CatalogShowcase, FeaturedProducts, CustomServices, RelatedProducts (desktop)
    // Eager: w_400,h_533,c_fill,f_auto,q_auto,g_auto
    card: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 533,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),

    // 4:5 portrait card — catalog/ProductGrid.vue, RelatedProducts (mobile)
    // Eager: w_400,h_500,c_fill,f_auto,q_auto,g_auto
    cardCatalog: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 500,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),

    // 3:4 portrait gallery main — ProductGallery main slide (~400-500px tampil)
    // Eager: w_800,h_1067,c_fill,f_auto,q_auto,g_auto
    gallery: (url: string) =>
      getOptimizedUrl(url, {
        width: 800,
        height: 1067,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),

    // Alias → gallery (w_800,h_1067): cukup untuk lightbox fullscreen bahkan di Retina
    // Tidak perlu eager terpisah, hemat 1 upload credit per gambar
    detail: (url: string) =>
      getOptimizedUrl(url, {
        width: 800,
        height: 1067,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),

    // Hero — file lokal (/img/bg.png), bukan Cloudinary → tidak melewati getOptimizedUrl
    // Fallback jika dipakai ke Cloudinary hero image
    hero: (url: string) =>
      getOptimizedUrl(url, {
        width: 800,
        height: 1067,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),

    // Icon/logo kecil — admin preview, alias → card (w_400): browser scale turun
    icon: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 533,
        quality: "auto",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      }),
  };

  /**
   * Mapping eager sizes: width → height yang cocok persis dengan Cloudinary eager config.
   * HANYA gunakan ukuran ini agar setiap srcset URL = CDN cache hit, 0 transform kredit.
   * 3 eager total: w_400,h_533 | w_400,h_500 | w_800,h_1067
   */
  const EAGER_MAP: Record<number, number> = {
    400: 533, // 3:4 (card)
    800: 1067, // 3:4 (gallery)
  };

  /**
   * Generate responsive srcset untuk <img> — hanya menggunakan eager sizes.
   * Pastikan w, h, c_fill, g_auto cocok persis dengan eager agar CDN selalu hit.
   */
  const generateSrcSet = (url: string, sizes: number[] = [400, 800, 1000]): string => {
    const validSizes = sizes.filter((s) => s in EAGER_MAP);
    return validSizes
      .map((w) => {
        const h = EAGER_MAP[w];
        const optimizedUrl = getOptimizedUrl(url, {
          width: w,
          height: h,
          quality: "auto",
          format: "auto",
          crop: "fill",
          gravity: "auto",
        });
        return `${optimizedUrl} ${w}w`;
      })
      .join(", ");
  };

  return {
    getOptimizedUrl,
    presets,
    generateSrcSet,
  };
};
