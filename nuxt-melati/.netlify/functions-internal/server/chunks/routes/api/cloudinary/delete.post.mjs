import { d as defineEventHandler, c as createError, r as readBody } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const delete_post = defineEventHandler(async (event) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables."
      });
    }
    const { publicId } = await readBody(event);
    if (!publicId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Public ID is required"
      });
    }
    let cloudinary;
    try {
      const cloudinaryModule = await import('cloudinary');
      cloudinary = cloudinaryModule.v2;
    } catch (importError) {
      console.error("Cloudinary import error:", importError);
      throw createError({
        statusCode: 500,
        statusMessage: "Cloudinary package not available. Please ensure it is installed: npm install cloudinary"
      });
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result,
      message: `Image ${publicId} deleted successfully`
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete image from Cloudinary"
    });
  }
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
