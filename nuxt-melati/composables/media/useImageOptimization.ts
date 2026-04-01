/**
 * Composable untuk Image Optimization dengan ImageKit
 * Auto-transform images: compress, resize, format optimization
 * ImageKit transformasi unlimited dan gratis — tidak perlu eager transforms.
 */

interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
  crop?: "maintain_ratio" | "force" | "at_max" | "at_least";
  focus?: "auto" | "face" | "center";
}

export const useImageOptimization = () => {
  /**
   * Transform ImageKit URL dengan optimization parameters
   * Contoh: https://ik.imagekit.io/your_id/melati-gold/products/sample.jpg
   * Menjadi: https://ik.imagekit.io/your_id/melati-gold/products/sample.jpg?tr=w-400,h-533,c-maintain_ratio,fo-auto,f-auto,q-auto
   */
  const getOptimizedUrl = (originalUrl: string, options: ImageKitTransformOptions = {}): string => {
    if (!originalUrl || !originalUrl.includes("ik.imagekit.io")) {
      return originalUrl;
    }

    const { width, height, quality = "auto", format = "auto", crop = "maintain_ratio", focus = "auto" } = options;

    const transforms: string[] = [];

    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (crop) transforms.push(`c-${crop}`);
    if (focus) transforms.push(`fo-${focus}`);
    transforms.push(`f-${format}`);
    transforms.push(`q-${quality}`);

    const transformString = transforms.join(",");
    const separator = originalUrl.includes("?") ? "&" : "?";
    return `${originalUrl}${separator}tr=${transformString}`;
  };

  /**
   * Preset transformations untuk ImageKit
   * Semua transformasi gratis dan on-the-fly — tidak perlu eager/CDN cache strategy.
   */
  const presets = {
    // Thumbnail/Icon — grid preview, browser scale down ke 80-160px tampil
    thumbnail: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 533,
        crop: "maintain_ratio",
        focus: "auto",
      }),

    // 3:4 portrait card — CatalogShowcase, FeaturedProducts, CustomServices, RelatedProducts (desktop)
    card: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 533,
        crop: "maintain_ratio",
        focus: "auto",
      }),

    // 4:5 portrait card — catalog/ProductGrid.vue, RelatedProducts (mobile)
    cardCatalog: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 500,
        crop: "maintain_ratio",
        focus: "auto",
      }),

    // 3:4 portrait gallery main — ProductGallery main slide
    gallery: (url: string) =>
      getOptimizedUrl(url, {
        width: 800,
        height: 1067,
        crop: "maintain_ratio",
        focus: "auto",
      }),

    // Detail/Lightbox — sama dengan gallery, cukup untuk Retina
    detail: (url: string) =>
      getOptimizedUrl(url, {
        width: 800,
        height: 1067,
        crop: "maintain_ratio",
        focus: "auto",
      }),

    // Hero desktop — landscape 16:9 full-screen
    hero: (url: string) =>
      getOptimizedUrl(url, {
        width: 1920,
        height: 1080,
        crop: "force",
        focus: "auto",
      }),

    // Hero mobile — portrait natural for mobile screens
    heroMobile: (url: string) =>
      getOptimizedUrl(url, {
        width: 768,
        height: 1024,
        crop: "force",
        focus: "auto",
      }),

    // Icon/logo kecil — admin preview
    icon: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 533,
        crop: "maintain_ratio",
        focus: "auto",
      }),
  };

  /**
   * Size mapping untuk srcset generation.
   */
  const SIZE_MAP: Record<number, number> = {
    400: 533,
    800: 1067,
  };

  /**
   * Generate responsive srcset untuk <img>
   */
  const generateSrcSet = (url: string, sizes: number[] = [400, 800]): string => {
    const validSizes = sizes.filter((s) => s in SIZE_MAP);
    return validSizes
      .map((w) => {
        const h = SIZE_MAP[w];
        const optimizedUrl = getOptimizedUrl(url, {
          width: w,
          height: h,
          crop: "maintain_ratio",
          focus: "auto",
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
