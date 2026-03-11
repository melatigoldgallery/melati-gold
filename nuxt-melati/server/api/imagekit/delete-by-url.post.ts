// ImageKit delete-by-url endpoint — find file by URL path, then delete by fileId
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

    const { url } = await readBody(event);

    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: "URL is required",
      });
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // Extract filename from URL
    let fileName: string;
    try {
      const urlPath = new URL(url).pathname;
      fileName = urlPath.split("/").pop() || "";
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid URL format",
      });
    }

    if (!fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: "Could not extract filename from URL",
      });
    }

    // v7 API: assets.list() for searching files
    const result = await imagekit.assets.list({
      searchQuery: `name="${fileName}"`,
      limit: 1,
    });

    const files = result?.data || [];
    if (!files || files.length === 0) {
      return {
        success: false,
        message: `File not found in ImageKit: ${fileName}`,
      };
    }

    // v7 API: files.delete(fileId)
    await imagekit.files.delete(files[0].fileId);

    return {
      success: true,
      message: `Deleted ${fileName} (fileId: ${files[0].fileId})`,
    };
  } catch (error: any) {
    console.error("ImageKit delete-by-url error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete file from ImageKit",
    });
  }
});
