/**
 * Composable untuk Image Optimization dengan Cloudinary
 * Auto-transform images: compress, resize, format optimization
 */

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
}

export const useImageOptimization = () => {
  /**
   * Transform Cloudinary URL dengan optimization parameters
   * Contoh: https://res.cloudinary.com/demo/image/upload/v1/sample.jpg
   * Menjadi: https://res.cloudinary.com/demo/image/upload/w_400,h_400,f_auto,q_auto/v1/sample.jpg
   */
  const getOptimizedUrl = (
    originalUrl: string,
    options: CloudinaryTransformOptions = {}
  ): string => {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl; // Return original if not Cloudinary URL
    }

    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
    } = options;

    // Build transformation string
    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    transformations.push(`f_${format}`); // Auto format (WebP jika browser support)
    transformations.push(`q_${quality}`); // Auto quality optimization

    const transformString = transformations.join(',');

    // Insert transformation into Cloudinary URL
    // Before: .../upload/v1/sample.jpg
    // After: .../upload/w_400,h_400,f_auto,q_auto/v1/sample.jpg
    return originalUrl.replace('/upload/', `/upload/${transformString}/`);
  };

  /**
   * Preset transformations untuk berbagai use cases
   */
  const presets = {
    // Thumbnail untuk grid produk
    thumbnail: (url: string) =>
      getOptimizedUrl(url, {
        width: 400,
        height: 400,
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
      }),

    // Card image medium
    card: (url: string) =>
      getOptimizedUrl(url, {
        width: 600,
        height: 600,
        quality: 'auto',
        format: 'auto',
      }),

    // Hero/banner image
    hero: (url: string) =>
      getOptimizedUrl(url, {
        width: 1200,
        height: 600,
        quality: 85,
        format: 'auto',
        crop: 'fill',
      }),

    // Detail modal (high quality but still optimized)
    detail: (url: string) =>
      getOptimizedUrl(url, {
        width: 1000,
        height: 1000,
        quality: 90,
        format: 'auto',
      }),

    // Gallery carousel
    gallery: (url: string) =>
      getOptimizedUrl(url, {
        width: 800,
        height: 800,
        quality: 'auto',
        format: 'auto',
      }),

    // Logo/icon
    icon: (url: string) =>
      getOptimizedUrl(url, {
        width: 200,
        height: 200,
        quality: 'auto',
        format: 'auto',
      }),
  };

  /**
   * Generate responsive srcset untuk <img>
   * Untuk responsive images di berbagai device
   */
  const generateSrcSet = (url: string, sizes: number[] = [400, 800, 1200]): string => {
    return sizes
      .map((size) => {
        const optimizedUrl = getOptimizedUrl(url, {
          width: size,
          quality: 'auto',
          format: 'auto',
        });
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  };

  return {
    getOptimizedUrl,
    presets,
    generateSrcSet,
  };
};
