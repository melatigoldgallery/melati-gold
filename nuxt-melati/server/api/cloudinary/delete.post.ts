// Cloudinary delete endpoint
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const cloudName = config.public.cloudinaryCloudName;
    const apiKey = config.public.cloudinaryApiKey;
    const apiSecret = config.cloudinaryApiSecret;

    if (!cloudName || !apiKey || !apiSecret) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Cloudinary not configured. Please set NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NUXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.",
      });
    }

    const { publicId, resourceType = "image" } = await readBody(event);

    if (!publicId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Public ID is required",
      });
    }

    // Try to import cloudinary with proper error handling
    let cloudinary;
    try {
      const cloudinaryModule = await import("cloudinary");
      cloudinary = cloudinaryModule.v2;
    } catch (importError: any) {
      console.error("Cloudinary import error:", importError);
      throw createError({
        statusCode: 500,
        statusMessage: "Cloudinary package not available. Please ensure it is installed: npm install cloudinary",
      });
    }

    // Configure cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Delete the asset (image or video)
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    return {
      success: true,
      result,
      message: `Asset ${publicId} deleted successfully`,
    };
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    if (error.statusCode) {
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete image from Cloudinary",
    });
  }
});
