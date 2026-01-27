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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          apartment: string | null
          building: string
          city: string
          created_at: string
          entrance: string | null
          floor: string | null
          id: string
          intercom: string | null
          is_default: boolean | null
          street: string
          title: string
          user_id: string
        }
        Insert: {
          apartment?: string | null
          building: string
          city?: string
          created_at?: string
          entrance?: string | null
          floor?: string | null
          id?: string
          intercom?: string | null
          is_default?: boolean | null
          street: string
          title?: string
          user_id: string
        }
        Update: {
          apartment?: string | null
          building?: string
          city?: string
          created_at?: string
          entrance?: string | null
          floor?: string | null
          id?: string
          intercom?: string | null
          is_default?: boolean | null
          street?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_text: string | null
          link_url: string | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_text?: string | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_text?: string | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          name: string
          phone: string
          processed_at: string | null
          status: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          name: string
          phone: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_categories: {
        Row: {
          category_id: string
          collection_id: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          collection_id: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          collection_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_categories_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coupon_uses: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          order_id: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_uses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          used_count: number | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          comment: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_cost: number | null
          delivery_date: string | null
          delivery_method: string
          delivery_time: string | null
          id: string
          order_number: string
          payment_method: string
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_id?: string | null
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_cost?: number | null
          delivery_date?: string | null
          delivery_method: string
          delivery_time?: string | null
          id?: string
          order_number: string
          payment_method: string
          status?: string
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_id?: string | null
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_cost?: number | null
          delivery_date?: string | null
          delivery_method?: string
          delivery_time?: string | null
          id?: string
          order_number?: string
          payment_method?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content: string | null
          extra_data: Json | null
          id: string
          is_visible: boolean | null
          page_slug: string
          section_key: string
          sort_order: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          extra_data?: Json | null
          id?: string
          is_visible?: boolean | null
          page_slug: string
          section_key: string
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          extra_data?: Json | null
          id?: string
          is_visible?: boolean | null
          page_slug?: string
          section_key?: string
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pending_wheel_spins: {
        Row: {
          created_at: string
          discount_type: string | null
          discount_value: number | null
          expires_at: string
          gift_product_id: string | null
          id: string
          prize_type: string
          segment_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string
          gift_product_id?: string | null
          id?: string
          prize_type: string
          segment_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string
          gift_product_id?: string | null
          id?: string
          prize_type?: string
          segment_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_wheel_spins_gift_product_id_fkey"
            columns: ["gift_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_wheel_spins_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "wheel_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          balloon_count: number | null
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          discount: number | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_hit: boolean | null
          is_new: boolean | null
          live_cover_url: string | null
          name: string
          occasion: string[] | null
          old_price: number | null
          on_order: boolean | null
          price: number
          rating: number | null
          reviews_count: number | null
          size: string | null
          type: string | null
          updated_at: string
          videos: string[] | null
        }
        Insert: {
          balloon_count?: number | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_hit?: boolean | null
          is_new?: boolean | null
          live_cover_url?: string | null
          name: string
          occasion?: string[] | null
          old_price?: number | null
          on_order?: boolean | null
          price: number
          rating?: number | null
          reviews_count?: number | null
          size?: string | null
          type?: string | null
          updated_at?: string
          videos?: string[] | null
        }
        Update: {
          balloon_count?: number | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_hit?: boolean | null
          is_new?: boolean | null
          live_cover_url?: string | null
          name?: string
          occasion?: string[] | null
          old_price?: number | null
          on_order?: boolean | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          size?: string | null
          type?: string | null
          updated_at?: string
          videos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          images: string[] | null
          product_id: string
          rating: number
          status: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string
          id: string
          key: string
          label: string
          sort_order: number | null
          type: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string
          id?: string
          key: string
          label: string
          sort_order?: number | null
          type?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string
          id?: string
          key?: string
          label?: string
          sort_order?: number | null
          type?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string
          gift_product_id: string | null
          gift_product_image: string | null
          gift_product_name: string | null
          id: string
          is_used: boolean
          order_id: string | null
          prize_type: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string
          gift_product_id?: string | null
          gift_product_image?: string | null
          gift_product_name?: string | null
          id?: string
          is_used?: boolean
          order_id?: string | null
          prize_type?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string
          gift_product_id?: string | null
          gift_product_image?: string | null
          gift_product_name?: string | null
          id?: string
          is_used?: boolean
          order_id?: string | null
          prize_type?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_gift_product_id_fkey"
            columns: ["gift_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wheel_spins: {
        Row: {
          coupon_id: string | null
          id: string
          segment_id: string | null
          spun_at: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          id?: string
          segment_id?: string | null
          spun_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          id?: string
          segment_id?: string | null
          spun_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wheel_spins_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "user_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_wheel_spins_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "wheel_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_segments: {
        Row: {
          color: string
          created_at: string
          discount_type: string
          discount_value: number
          gift_product_id: string | null
          id: string
          is_active: boolean
          label: string
          prize_type: string
          probability: number
          sort_order: number | null
        }
        Insert: {
          color?: string
          created_at?: string
          discount_type?: string
          discount_value: number
          gift_product_id?: string | null
          id?: string
          is_active?: boolean
          label: string
          prize_type?: string
          probability?: number
          sort_order?: number | null
        }
        Update: {
          color?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          gift_product_id?: string | null
          id?: string
          is_active?: boolean
          label?: string
          prize_type?: string
          probability?: number
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wheel_segments_gift_product_id_fkey"
            columns: ["gift_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
