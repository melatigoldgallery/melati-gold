// ImageKit delete endpoint — delete file by fileId
import ImageKit from "@imagekit/nodejs";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();

    const urlEndpoint = config.public.imagekitUrlEndpoint;
    const publicKey = config.public.imagekitPublicKey;
    const privateKey = config.imagekitPrivateKey;

    if (!urlEndpoint || !publicKey || !privateKey) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "ImageKit not configured. Please set NUXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, NUXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_PRIVATE_KEY in environment variables.",
      });
    }

    const { fileId } = await readBody(event);

    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: "File ID is required",
      });
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // v7 API: files.delete(fileId)
    await imagekit.files.delete(fileId);

    return {
      success: true,
      message: `File ${fileId} deleted successfully`,
    };
  } catch (error: any) {
    console.error("ImageKit delete error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete file from ImageKit",
    });
  }
});
