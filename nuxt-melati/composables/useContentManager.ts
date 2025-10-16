// Universal composable untuk manage semua content sections
export interface ContentItem {
  id: string;
  sectionKey: string;
  itemKey: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  metadata?: Record<string, any>;
  displayOrder: number;
  isActive: boolean;
}

export const useContentManager = () => {
  // Use the custom Supabase client
  const { $supabase } = useNuxtApp();
  const supabase = $supabase;

  const content = ref<Record<string, ContentItem[]>>({});
  const loading = ref(false);

  // Load content by section (with fallback for no database)
  const loadContent = async (sectionKey?: string) => {
    if (!supabase) {
      console.warn("Supabase not configured, using mock data");
      return;
    }

    loading.value = true;
    try {
      let query = supabase
        .from("content_sections")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (sectionKey) {
        query = query.eq("section_key", sectionKey);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by section
      const grouped = (data || []).reduce((acc, item) => {
        const key = item.section_key;
        if (!acc[key]) acc[key] = [];
        acc[key].push({
          id: item.id,
          sectionKey: item.section_key,
          itemKey: item.item_key,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          price: item.price,
          metadata: item.metadata || {},
          displayOrder: item.display_order,
          isActive: item.is_active,
        });
        return acc;
      }, {} as Record<string, ContentItem[]>);

      if (sectionKey) {
        content.value[sectionKey] = grouped[sectionKey] || [];
      } else {
        content.value = grouped;
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      loading.value = false;
    }
  };

  // Get content by section
  const getContent = (sectionKey: string) => {
    return computed(() => content.value[sectionKey] || []);
  };

  // Create or update content (with database check)
  const saveContent = async (item: Partial<ContentItem>) => {
    if (!supabase) {
      console.warn("Supabase not configured");
      return { success: false, error: "Database not available" };
    }

    try {
      const payload = {
        section_key: item.sectionKey,
        item_key: item.itemKey,
        title: item.title,
        description: item.description,
        image_url: item.imageUrl,
        price: item.price,
        metadata: item.metadata,
        display_order: item.displayOrder || 0,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = item.id
        ? await supabase.from("content_sections").update(payload).eq("id", item.id).select().single()
        : await supabase.from("content_sections").insert(payload).select().single();

      if (error) throw error;

      // Update local state
      await loadContent(item.sectionKey);
      return { success: true, data };
    } catch (error) {
      console.error("Error saving content:", error);
      return { success: false, error };
    }
  };

  // Delete content (with database check)
  const deleteContent = async (id: string, sectionKey: string) => {
    if (!supabase) {
      console.warn("Supabase not configured");
      return { success: false, error: "Database not available" };
    }

    try {
      const { error } = await supabase.from("content_sections").delete().eq("id", id);

      if (error) throw error;

      await loadContent(sectionKey);
      return { success: true };
    } catch (error) {
      console.error("Error deleting content:", error);
      return { success: false, error };
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file: File, folder = "general") => {
    try {
      const config = useRuntimeConfig();
      const cloudName = config.public.cloudinaryCloudName;
      const uploadPreset = config.public.cloudinaryUploadPreset;

      if (!cloudName || !uploadPreset) {
        console.warn("Cloudinary not configured");
        return { success: false, error: "Cloudinary not configured" };
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `melati-gold/${folder}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Upload failed");
      }

      return { success: true, url: result.secure_url, publicId: result.public_id };
    } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error };
    }
  };

  return {
    content: readonly(content),
    loading: readonly(loading),
    loadContent,
    getContent,
    saveContent,
    deleteContent,
    uploadImage,
  };
};
