export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_uid: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          role: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          auth_uid?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          role?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          auth_uid?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          role?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      best_seller_analytics: {
        Row: {
          created_at: string | null
          id: string
          inquiry_count: number | null
          month: string
          product_id: string | null
          sales_estimate: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_count?: number | null
          month: string
          product_id?: string | null
          sales_estimate?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_count?: number | null
          month?: string
          product_id?: string | null
          sales_estimate?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "best_seller_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "best_seller_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_best_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "best_seller_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "best_seller_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_featured_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "best_seller_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_products_with_calculated_price"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_categories: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_products: {
        Row: {
          base_price: number | null
          category_id: string | null
          created_at: string | null
          custom_shopee_link: string | null
          custom_tokopedia_link: string | null
          custom_whatsapp_number: string | null
          description: string | null
          display_order: number | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          karat: string | null
          name: string | null
          price: number | null
          price_display: string | null
          price_override: boolean | null
          slug: string | null
          specs: Json | null
          stock_status: string | null
          subcategory_id: string | null
          thumbnail_image: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
          weight: string | null
          weight_grams: number | null
        }
        Insert: {
          base_price?: number | null
          category_id?: string | null
          created_at?: string | null
          custom_shopee_link?: string | null
          custom_tokopedia_link?: string | null
          custom_whatsapp_number?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          karat?: string | null
          name?: string | null
          price?: number | null
          price_display?: string | null
          price_override?: boolean | null
          slug?: string | null
          specs?: Json | null
          stock_status?: string | null
          subcategory_id?: string | null
          thumbnail_image?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          weight?: string | null
          weight_grams?: number | null
        }
        Update: {
          base_price?: number | null
          category_id?: string | null
          created_at?: string | null
          custom_shopee_link?: string | null
          custom_tokopedia_link?: string | null
          custom_whatsapp_number?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          karat?: string | null
          name?: string | null
          price?: number | null
          price_display?: string | null
          price_override?: boolean | null
          slug?: string | null
          specs?: Json | null
          stock_status?: string | null
          subcategory_id?: string | null
          thumbnail_image?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          weight?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["category_id_full"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["subcategory_id_full"]
          },
        ]
      }
      catalog_subcategories: {
        Row: {
          category_id: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["category_id_full"]
          },
        ]
      }
      content_sections: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          item_key: string
          metadata: Json | null
          price: number | null
          section_key: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          item_key: string
          metadata?: Json | null
          price?: number | null
          section_key: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          item_key?: string
          metadata?: Json | null
          price?: number | null
          section_key?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_services: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          duration: string | null
          example_products: string[] | null
          features: Json | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_info: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration?: string | null
          example_products?: string[] | null
          features?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_info?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration?: string | null
          example_products?: string[] | null
          features?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_info?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gold_price_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          karat: string
          new_price: number
          notes: string | null
          old_price: number | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          karat: string
          new_price: number
          notes?: string | null
          old_price?: number | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          karat?: string
          new_price?: number
          notes?: string | null
          old_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gold_price_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      gold_price_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          karat: string
          price_per_gram: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          karat: string
          price_per_gram: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          karat?: string
          price_per_gram?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gold_price_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      karat_configurations: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          karat_list: string[]
          name: string
          shopee_store_url: string | null
          tokopedia_store_url: string | null
          updated_at: string | null
          whatsapp_message_template: string | null
          whatsapp_number: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          karat_list: string[]
          name: string
          shopee_store_url?: string | null
          tokopedia_store_url?: string | null
          updated_at?: string | null
          whatsapp_message_template?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          karat_list?: string[]
          name?: string
          shopee_store_url?: string | null
          tokopedia_store_url?: string | null
          updated_at?: string | null
          whatsapp_message_template?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_best_sellers: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          custom_shopee_link: string | null
          custom_whatsapp_number: string | null
          description: string | null
          display_order: number | null
          id: string | null
          images: Json | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          karat: string | null
          name: string | null
          price: number | null
          price_display: string | null
          specs: Json | null
          stock_status: string | null
          subcategory_id: string | null
          subcategory_name: string | null
          subcategory_slug: string | null
          thumbnail_image: string | null
          title: string | null
          video_url: string | null
          weight: string | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["category_id_full"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["subcategory_id_full"]
          },
        ]
      }
      v_catalog_products_full: {
        Row: {
          category_description: string | null
          category_icon: string | null
          category_id: string | null
          category_id_full: string | null
          category_is_active: boolean | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          custom_shopee_link: string | null
          custom_whatsapp_number: string | null
          description: string | null
          display_order: number | null
          id: string | null
          images: Json | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          karat: string | null
          name: string | null
          price: number | null
          price_display: string | null
          price_override: boolean | null
          specs: Json | null
          stock_status: string | null
          subcategory_description: string | null
          subcategory_id: string | null
          subcategory_id_full: string | null
          subcategory_is_active: boolean | null
          subcategory_name: string | null
          subcategory_slug: string | null
          thumbnail_image: string | null
          title: string | null
          updated_at: string | null
          video_url: string | null
          view_count: number | null
          weight: string | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["category_id_full"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["subcategory_id_full"]
          },
        ]
      }
      v_featured_products: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          custom_shopee_link: string | null
          custom_whatsapp_number: string | null
          description: string | null
          display_order: number | null
          id: string | null
          images: Json | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          karat: string | null
          name: string | null
          price: number | null
          price_display: string | null
          specs: Json | null
          stock_status: string | null
          subcategory_id: string | null
          subcategory_name: string | null
          subcategory_slug: string | null
          thumbnail_image: string | null
          title: string | null
          video_url: string | null
          weight: string | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["category_id_full"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["subcategory_id_full"]
          },
        ]
      }
      vw_products_with_calculated_price: {
        Row: {
          calculated_price: number | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          custom_shopee_link: string | null
          custom_whatsapp_number: string | null
          description: string | null
          display_order: number | null
          id: string | null
          images: Json | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          karat: string | null
          name: string | null
          price: number | null
          price_display: string | null
          price_override: boolean | null
          specs: Json | null
          stock_status: string | null
          subcategory_id: string | null
          subcategory_name: string | null
          subcategory_slug: string | null
          thumbnail_image: string | null
          title: string | null
          updated_at: string | null
          video_url: string | null
          weight: string | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["category_id_full"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_catalog_products_full"
            referencedColumns: ["subcategory_id_full"]
          },
        ]
      }
    }
    Functions: {
      create_admin_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_password: string
          p_role?: string
          p_username: string
        }
        Returns: string
      }
      get_current_user_email: { Args: never; Returns: string }
      increment_product_view: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_supervisor: { Args: never; Returns: boolean }
      toggle_best_seller: { Args: { p_product_id: string }; Returns: boolean }
      toggle_featured: { Args: { p_product_id: string }; Returns: boolean }
      update_admin_password: {
        Args: { p_new_password: string; p_user_id: string }
        Returns: boolean
      }
      verify_admin_password: {
        Args: { p_password: string; p_username: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
