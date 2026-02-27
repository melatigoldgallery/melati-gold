// Cloudinary usage endpoint
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

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const usage = await cloudinary.api.usage();
    return {
      success: true,
      bytes: usage.bytes,
      limit: usage.limit,
      used_percent: (usage.bytes / usage.limit) * 100,
      message: "Cloudinary usage retrieved successfully",
    };
  } catch (error: any) {
    console.error("Cloudinary usage error:", error);

    // Handle specific error types
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to get Cloudinary usage information",
    });
  }
});
