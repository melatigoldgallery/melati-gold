// Cloudinary delete endpoint
export default defineEventHandler(async (event) => {
  try {
    // Check if cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.",
      });
    }

    const { publicId } = await readBody(event);

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

    // Delete the image
    const result = await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
      result,
      message: `Image ${publicId} deleted successfully`,
    };
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);

    // Handle specific error types
    if (error.statusCode) {
      throw error; // Re-throw createError instances
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete image from Cloudinary",
    });
  }
});
