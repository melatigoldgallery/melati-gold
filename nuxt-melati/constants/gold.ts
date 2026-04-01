/** Kadar karat yang tersedia dan label tampilannya */
export const KARAT_LABELS: Record<string, string> = {
  kadar_muda: "Kadar Muda (75%)",
  kadar_tua: "Kadar Tua (70%)",
} as const;

/** Satuan berat default untuk produk emas */
export const DEFAULT_WEIGHT_UNIT = "gram" as const;

/** Maklon fee default (persen) */
export const DEFAULT_MAKLON_PERCENT = 20 as const;

/** Batas maksimal jumlah foto per produk */
export const MAX_PRODUCT_IMAGES = 10 as const;
