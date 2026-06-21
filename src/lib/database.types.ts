// Auto-generated from supabase/migrations/001_initial_schema.sql
// Re-generate with: supabase gen types typescript --project-id <REF> > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          business_name: string | null
          language_preference: string
          currency: string
          printer_enabled: boolean
          token_system_enabled: boolean
          close_day_pin: string | null
          created_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          language_preference?: string
          currency?: string
          printer_enabled?: boolean
          token_system_enabled?: boolean
          close_day_pin?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          language_preference?: string
          currency?: string
          printer_enabled?: boolean
          token_system_enabled?: boolean
          close_day_pin?: string | null
          created_at?: string
        }
        Relationships: []
      }
      operators: {
        Row: {
          id: string
          owner_id: string
          name: string
          phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          phone?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          phone?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          owner_id: string
          name: string
          category: string | null
          price: number
          is_available: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          category?: string | null
          price: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          category?: string | null
          price?: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      daily_menu_overrides: {
        Row: {
          id: string
          owner_id: string
          menu_item_id: string
          override_date: string
          is_available_today: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          menu_item_id: string
          override_date?: string
          is_available_today: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          menu_item_id?: string
          override_date?: string
          is_available_today?: boolean
          created_at?: string
        }
        Relationships: []
      }
      day_sessions: {
        Row: {
          id: string
          owner_id: string
          session_date: string
          status: string
          opened_at: string
          close_requested_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          session_date?: string
          status?: string
          opened_at?: string
          close_requested_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          session_date?: string
          status?: string
          opened_at?: string
          close_requested_at?: string | null
          closed_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          owner_id: string
          order_date: string
          order_time: string
          total_amount: number
          payment_mode: string
          token_number: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          order_date?: string
          order_time?: string
          total_amount: number
          payment_mode?: string
          token_number?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          order_date?: string
          order_time?: string
          total_amount?: number
          payment_mode?: string
          token_number?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          item_name: string
          item_price: number
          quantity: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          item_name: string
          item_price: number
          quantity?: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          item_name?: string
          item_price?: number
          quantity?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          id: string
          owner_id: string
          summary_date: string
          total_orders: number
          total_revenue: number
          best_seller_name: string | null
          best_seller_quantity: number
          slowest_seller_name: string | null
          slowest_seller_quantity: number
          busiest_hour: number | null
          avg_order_value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          summary_date: string
          total_orders?: number
          total_revenue?: number
          best_seller_name?: string | null
          best_seller_quantity?: number
          slowest_seller_name?: string | null
          slowest_seller_quantity?: number
          busiest_hour?: number | null
          avg_order_value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          summary_date?: string
          total_orders?: number
          total_revenue?: number
          best_seller_name?: string | null
          best_seller_quantity?: number
          slowest_seller_name?: string | null
          slowest_seller_quantity?: number
          busiest_hour?: number | null
          avg_order_value?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
