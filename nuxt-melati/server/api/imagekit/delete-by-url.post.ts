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
      privateKey,
    });

    // Extract filePath from URL: strip urlEndpoint prefix and query params
    // e.g. https://ik.imagekit.io/melatigold/melati-gold/products/abc.jpg?tr=... → /melati-gold/products/abc.jpg
    // Extract decoded filename and directory from URL
    // URL example: https://ik.imagekit.io/melatigold/melati-gold/products/abc.jpg?tr=...
    let fileName: string;
    let dirPath: string;
    try {
      const urlObj = new URL(url);
      // Decode %20 etc., strip query string (transforms)
      const decodedPathname = decodeURIComponent(urlObj.pathname);
      // Strip the ImageKit account prefix: /melatigold/melati-gold/... → /melati-gold/...
      const endpointPathname = new URL(urlEndpoint).pathname;
      const filePath = decodedPathname.startsWith(endpointPathname)
        ? decodedPathname.slice(endpointPathname.length)
        : decodedPathname;
      const lastSlash = filePath.lastIndexOf("/");
      fileName = filePath.slice(lastSlash + 1);
      dirPath = lastSlash > 0 ? filePath.slice(0, lastSlash) : "/";
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

    // Search by name (supported field) within the specific directory (path param)
    // to avoid false positives from same-named files in different folders
    const results = await imagekit.assets.list({
      path: dirPath,
      searchQuery: `name = "${fileName}"`,
      limit: 1,
    });

    // assets.list returns array directly in v7; filter to File items (Folder has no fileId)
    const files = Array.isArray(results) ? results : [];
    const fileItem = files.find((f: unknown) => typeof f === "object" && f !== null && "fileId" in f) as
      | { fileId: string }
      | undefined;
    if (!fileItem) {
      return {
        success: false,
        message: `File not found in ImageKit: ${dirPath}/${fileName}`,
      };
    }

    // v7 API: files.delete(fileId)
    await imagekit.files.delete(fileItem.fileId);

    return {
      success: true,
      message: `Deleted ${dirPath}/${fileName} (fileId: ${fileItem.fileId})`,
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
