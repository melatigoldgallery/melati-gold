// Composable untuk Cloudinary operations
export const useCloudinary = () => {
  const config = useRuntimeConfig();
  const uploading = ref(false);

  // Upload single file
  const uploadFile = async (file: File, folder = "general") => {
    uploading.value = true;
    try {
      const cloudName = config.public.cloudinaryCloudName;
      const uploadPreset = config.public.cloudinaryUploadPreset;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary not configured");
      }

      // Detect if it's a video file
      const isVideo = file.type.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `melati-gold/${folder}`);
      formData.append("resource_type", resourceType);

      // Add timestamp untuk unique filename
      formData.append("public_id", `${folder}_${Date.now()}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Upload failed");
      }

      return {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
      };
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    } finally {
      uploading.value = false;
    }
  };

  // Delete file from Cloudinary
  const deleteFile = async (publicId: string) => {
    try {
      const response = await $fetch("/api/cloudinary/delete", {
        method: "POST",
        body: { publicId },
      });

      return { success: true, data: response };
    } catch (error: any) {
      console.error("Cloudinary delete error:", error);
      return {
        success: false,
        error: error.message || "Delete failed",
      };
    }
  };

  // Get Cloudinary usage
  const getUsage = async () => {
    try {
      const response = await $fetch("/api/cloudinary/usage");
      return { success: true, data: response };
    } catch (error: any) {
      console.error("Cloudinary usage error:", error);
      return {
        success: false,
        error: error.message || "Failed to get usage",
      };
    }
  };

  // Transform image URL with Cloudinary transformations
  const transformImage = (url: string, transformations: string) => {
    if (!url || !url.includes("cloudinary.com")) return url;

    // Insert transformations before '/upload/'
    return url.replace("/upload/", `/upload/${transformations}/`);
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
    const transforms = [];

    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.format) transforms.push(`f_${options.format}`);

    // Add auto format and quality for better optimization
    if (!options.format) transforms.push("f_auto");
    if (!options.quality) transforms.push("q_auto");

    return transformImage(url, transforms.join(","));
  };

  return {
    uploading: readonly(uploading),
    uploadFile,
    deleteFile,
    getUsage,
    transformImage,
    getOptimizedUrl,
  };
};
