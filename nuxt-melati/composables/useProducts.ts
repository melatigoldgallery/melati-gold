import type { Product } from "~/types/product";

export function useProducts() {
  const config = useRuntimeConfig();
  const products = ref<Product[] | null>(null);
  const pending = ref(false);
  const error = ref<Error | null>(null);

  async function fetchFromSupabase() {
    // Placeholder: switch to real Supabase query later
    try {
      pending.value = true;
      error.value = null;
      products.value = [
        { id: "1", name: "Cincin Berlian", price: 4500000, image: "/img/ring.jpg", karat: "17K" },
        { id: "2", name: "Anting Elegan", price: 2800000, image: "/img/earrings1.jpg", karat: "16K" },
        { id: "3", name: "Kalung Mewah", price: 5200000, image: "/img/necklace.jpg", karat: "17K" },
        { id: "4", name: "Gelang Rantai", price: 3200000, image: "/img/bracelet3.jpg", karat: "16K" },
      ];
      // }
    } catch (e: any) {
      error.value = e;
    } finally {
      pending.value = false;
    }
  }

  onMounted(fetchFromSupabase);

  return { products, pending, error, fetchFromSupabase };
}
