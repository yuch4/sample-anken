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
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'sales' | 'manager' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'sales' | 'manager' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'sales' | 'manager' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          company_name: string
          contact_person: string | null
          status: 'lead' | 'negotiation' | 'proposal' | 'won' | 'lost'
          sales_amount: number
          gross_profit: number
          probability: number
          category: string | null
          expected_order_month: string | null
          expected_booking_month: string | null
          assigned_user_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          contact_person?: string | null
          status?: 'lead' | 'negotiation' | 'proposal' | 'won' | 'lost'
          sales_amount: number
          gross_profit: number
          probability?: number
          category?: string | null
          expected_order_month?: string | null
          expected_booking_month?: string | null
          assigned_user_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string | null
          status?: 'lead' | 'negotiation' | 'proposal' | 'won' | 'lost'
          sales_amount?: number
          gross_profit?: number
          probability?: number
          category?: string | null
          expected_order_month?: string | null
          expected_booking_month?: string | null
          assigned_user_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          project_id: string
          user_id: string
          activity_type: 'visit' | 'call' | 'email' | 'meeting'
          content: string
          activity_date: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          activity_type: 'visit' | 'call' | 'email' | 'meeting'
          content: string
          activity_date: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          activity_type?: 'visit' | 'call' | 'email' | 'meeting'
          content?: string
          activity_date?: string
          created_at?: string
        }
      }
      monthly_targets: {
        Row: {
          id: string
          target_month: string
          sales_target: number
          profit_target: number
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          target_month: string
          sales_target: number
          profit_target: number
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          target_month?: string
          sales_target?: number
          profit_target?: number
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
