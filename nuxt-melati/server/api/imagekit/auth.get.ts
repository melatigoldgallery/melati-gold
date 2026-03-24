// ImageKit authentication endpoint — generates signed auth params for client-side uploads
import ImageKit from "@imagekit/nodejs";

export default defineEventHandler(async () => {
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

  const imagekit = new ImageKit({
    privateKey,
  });

  // v7 API: helper.getAuthenticationParameters()
  const authParams = imagekit.helper.getAuthenticationParameters();
  return authParams;
});
