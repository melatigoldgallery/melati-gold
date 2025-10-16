// Database utility functions
export const useDatabase = () => {
  const { $supabase } = useNuxtApp();
  const supabase = $supabase;

  // Check if database is connected
  const checkConnection = async () => {
    if (!supabase) {
      return { connected: false, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await supabase.from("content_sections").select("id").limit(1);

      if (error) throw error;

      return { connected: true, data };
    } catch (error: any) {
      console.error("Database connection error:", error);
      return { connected: false, error: error.message };
    }
  };

  // Initialize database with sample data
  const initializeDatabase = async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const sampleData = [
      {
        section_key: "products",
        item_key: "featured_1",
        title: "Cincin Berlian",
        description: "Cincin berlian elegan dengan potongan modern, cocok untuk momen spesial.",
        image_url: "/img/ring.jpg",
        price: 4500000,
        metadata: {
          karat: "17K",
          weight: "2.8 gr",
          images: ["/img/ring.jpg", "/img/ring2.jpg", "/img/rings1.jpg"],
        },
        display_order: 1,
        is_active: true,
      },
      {
        section_key: "products",
        item_key: "featured_2",
        title: "Anting Elegan",
        description: "Anting emas berkilau dengan desain timeless untuk tampilan anggun.",
        image_url: "/img/earrings1.jpg",
        price: 2800000,
        metadata: {
          karat: "16K",
          weight: "2.1 gr",
          images: ["/img/earrings1.jpg", "/img/earrings2.jpg"],
        },
        display_order: 2,
        is_active: true,
      },
      {
        section_key: "products",
        item_key: "featured_3",
        title: "Kalung Mewah",
        description: "Kalung emas mewah dengan detail halus yang menonjolkan pesona.",
        image_url: "/img/necklace.jpg",
        price: 5200000,
        metadata: {
          karat: "17K",
          weight: "5.4 gr",
          images: ["/img/necklace.jpg", "/img/necklace2.jpg"],
        },
        display_order: 3,
        is_active: true,
      },
      {
        section_key: "services",
        item_key: "consultation",
        title: "Konsultasi Gratis",
        description: "Konsultasi desain dan pemilihan perhiasan sesuai kebutuhan Anda.",
        image_url: "/img/custom.jpg",
        metadata: {
          icon: "chat",
          duration: "30 menit",
        },
        display_order: 1,
        is_active: true,
      },
      {
        section_key: "services",
        item_key: "custom_design",
        title: "Desain Custom",
        description: "Layanan pembuatan perhiasan sesuai desain impian Anda.",
        image_url: "/img/custom.jpg",
        metadata: {
          icon: "design",
          process: "14 hari",
        },
        display_order: 2,
        is_active: true,
      },
      {
        section_key: "about",
        item_key: "main_story",
        title: "Tentang Melati Gold",
        description:
          "Melati Gold adalah toko perhiasan terpercaya dengan pengalaman lebih dari 20 tahun dalam memberikan perhiasan berkualitas tinggi.",
        image_url: "/img/bg.png",
        metadata: {
          established: "2003",
          experience: "20+ tahun",
        },
        display_order: 1,
        is_active: true,
      },
    ];

    try {
      // Check if data already exists
      const { data: existing } = await supabase.from("content_sections").select("id").limit(1);

      if (existing && existing.length > 0) {
        return { success: true, message: "Database already initialized" };
      }

      // Insert sample data
      const { data, error } = await supabase.from("content_sections").insert(sampleData).select();

      if (error) throw error;

      return { success: true, data, message: "Database initialized successfully" };
    } catch (error: any) {
      console.error("Database initialization error:", error);
      throw new Error(`Failed to initialize database: ${error.message}`);
    }
  };

  // Clear all data (for testing)
  const clearDatabase = async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    try {
      const { error } = await supabase
        .from("content_sections")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      return { success: true, message: "Database cleared successfully" };
    } catch (error: any) {
      console.error("Database clear error:", error);
      throw new Error(`Failed to clear database: ${error.message}`);
    }
  };

  return {
    checkConnection,
    initializeDatabase,
    clearDatabase,
  };
};
