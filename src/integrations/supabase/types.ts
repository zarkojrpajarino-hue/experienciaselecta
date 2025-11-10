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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      basket_catalog: {
        Row: {
          category: string
          created_at: string
          current_price: number
          description: string | null
          display_order: number | null
          features: string[] | null
          id: string
          image_url: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_price: number
          description?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_price?: number
          description?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      basket_experiences: {
        Row: {
          basket_category: string
          basket_name: string
          created_at: string | null
          id: string
          purchase_date: string
          status: string
          user_email: string
        }
        Insert: {
          basket_category: string
          basket_name: string
          created_at?: string | null
          id?: string
          purchase_date: string
          status?: string
          user_email: string
        }
        Update: {
          basket_category?: string
          basket_name?: string
          created_at?: string | null
          id?: string
          purchase_date?: string
          status?: string
          user_email?: string
        }
        Relationships: []
      }
      cookie_consents: {
        Row: {
          consented_at: string
          created_at: string
          email: string
          id: string
          marketing_email_sent: boolean
          marketing_email_sent_at: string | null
          user_id: string
        }
        Insert: {
          consented_at?: string
          created_at?: string
          email: string
          id?: string
          marketing_email_sent?: boolean
          marketing_email_sent_at?: string | null
          user_id: string
        }
        Update: {
          consented_at?: string
          created_at?: string
          email?: string
          id?: string
          marketing_email_sent?: boolean
          marketing_email_sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          postal_code: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          postal_code: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          purpose: string | null
          token: string
          used: boolean | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          purpose?: string | null
          token?: string
          used?: boolean | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          purpose?: string | null
          token?: string
          used?: boolean | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          basket_category: string
          basket_name: string
          created_at: string
          id: string
          order_id: string
          price_per_item: number
          quantity: number
        }
        Insert: {
          basket_category: string
          basket_name: string
          created_at?: string
          id?: string
          order_id: string
          price_per_item: number
          quantity?: number
        }
        Update: {
          basket_category?: string
          basket_name?: string
          created_at?: string
          id?: string
          order_id?: string
          price_per_item?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "completed_purchases"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["order_id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          currency: string
          customer_id: string
          id: string
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_country?: string
          shipping_postal_code: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_country?: string
          shipping_postal_code?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_gifts: {
        Row: {
          basket_category: string
          basket_image: string | null
          basket_name: string
          created_at: string
          gift_claimed: boolean
          id: string
          order_id: string
          personal_note: string | null
          price: number
          quantity: number
          recipient_email: string
          recipient_name: string
          recipient_user_id: string | null
          reminder_count: number | null
          reminder_sent_at: string | null
          sender_email: string | null
          sender_name: string
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_completed: boolean
          shipping_country: string | null
          shipping_postal_code: string | null
          updated_at: string
        }
        Insert: {
          basket_category: string
          basket_image?: string | null
          basket_name: string
          created_at?: string
          gift_claimed?: boolean
          id?: string
          order_id: string
          personal_note?: string | null
          price: number
          quantity?: number
          recipient_email: string
          recipient_name: string
          recipient_user_id?: string | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          sender_email?: string | null
          sender_name: string
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_completed?: boolean
          shipping_country?: string | null
          shipping_postal_code?: string | null
          updated_at?: string
        }
        Update: {
          basket_category?: string
          basket_image?: string | null
          basket_name?: string
          created_at?: string
          gift_claimed?: boolean
          id?: string
          order_id?: string
          personal_note?: string | null
          price?: number
          quantity?: number
          recipient_email?: string
          recipient_name?: string
          recipient_user_id?: string | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          sender_email?: string | null
          sender_name?: string
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_completed?: boolean
          shipping_country?: string | null
          shipping_postal_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_gifts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "completed_purchases"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "pending_gifts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_gifts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["order_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_reminders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_sent_at: string
          next_send_at: string | null
          order_id: string
          reminder_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_sent_at?: string
          next_send_at?: string | null
          order_id: string
          reminder_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_sent_at?: string
          next_send_at?: string | null
          order_id?: string
          reminder_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reminders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "completed_purchases"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "review_reminders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reminders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "purchases"
            referencedColumns: ["order_id"]
          },
        ]
      }
      reviews: {
        Row: {
          basket_name: string
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          source_site: string
          updated_at: string
          user_id: string
        }
        Insert: {
          basket_name: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          source_site?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          basket_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          source_site?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "completed_purchases"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["order_id"]
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      completed_purchases: {
        Row: {
          basket_category: string | null
          basket_image: string | null
          basket_name: string | null
          order_id: string | null
          price: number | null
          purchase_date: string | null
          purchase_type: string | null
          quantity: number | null
          total_paid: number | null
          user_email: string | null
          user_name: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          basket_category: string | null
          basket_name: string | null
          email: string | null
          order_id: string | null
          order_status: string | null
          purchased_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
