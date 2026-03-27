// Composable untuk ImageKit operations: upload, delete, transform
export const useImageKit = () => {
  const config = useRuntimeConfig();
  const uploading = ref(false);

  // Upload single file via ImageKit (client-side with server auth)
  const uploadFile = async (file: File, folder = "general") => {
    uploading.value = true;
    try {
      const urlEndpoint = config.public.imagekitUrlEndpoint;
      const publicKey = config.public.imagekitPublicKey;

      if (!urlEndpoint || !publicKey) {
        throw new Error("ImageKit not configured");
      }

      // 1. Get auth params from server
      const authParams = await $fetch<{ token: string; expire: number; signature: string }>("/api/imagekit/auth");

      // 2. Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", publicKey);
      formData.append("signature", authParams.signature);
      formData.append("expire", String(authParams.expire));
      formData.append("token", authParams.token);
      formData.append("fileName", `${folder}_${Date.now()}_${file.name}`);
      formData.append("folder", `/melati-gold/${folder}`);

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      return {
        success: true,
        data: {
          url: result.url,
          fileId: result.fileId,
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          format: result.fileType,
          bytes: result.size,
        },
      };
    } catch (error: any) {
      console.error("ImageKit upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    } finally {
      uploading.value = false;
    }
  };

  // Delete file from ImageKit by fileId
  const deleteFile = async (fileId: string) => {
    try {
      const response = await $fetch("/api/imagekit/delete", {
        method: "POST",
        body: { fileId },
      });

      return { success: true, data: response };
    } catch (error: any) {
      console.error("ImageKit delete error:", error);
      return {
        success: false,
        error: error.message || "Delete failed",
      };
    }
  };

  // Delete file from ImageKit by URL (search by filename, then delete)
  const deleteFileByUrl = async (url: string) => {
    if (!url || !url.includes("ik.imagekit.io")) {
      return { success: false, error: "Not an ImageKit URL" };
    }

    try {
      const response = await $fetch("/api/imagekit/delete-by-url", {
        method: "POST",
        body: { url },
      });

      return { success: true, data: response };
    } catch (error: any) {
      console.error("ImageKit delete by URL error:", error);
      return {
        success: false,
        error: error.message || "Delete failed",
      };
    }
  };

  // Transform image URL with ImageKit transformations (query parameter approach)
  const transformImage = (url: string, transformations: string) => {
    if (!url || !url.includes("ik.imagekit.io")) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tr=${transformations}`;
  };

  // Common transformations
  const getOptimizedUrl = (
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number | string;
      format?: string;
    } = {},
  ) => {
    const transforms: string[] = [];

    if (options.width) transforms.push(`w-${options.width}`);
    if (options.height) transforms.push(`h-${options.height}`);
    if (options.quality) transforms.push(`q-${options.quality}`);
    if (options.format) transforms.push(`f-${options.format}`);

    // Auto format and quality for better optimization
    if (!options.format) transforms.push("f-auto");
    if (!options.quality) transforms.push("q-auto");

    return transformImage(url, transforms.join(","));
  };

  return {
    uploading: readonly(uploading),
    uploadFile,
    deleteFile,
    deleteFileByUrl,
    transformImage,
    getOptimizedUrl,
  };
};
