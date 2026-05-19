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
      campaigns: {
        Row: {
          id: string
          name: string
          template_html: string | null
          template_text: string | null
          status: 'draft' | 'scheduled' | 'sending' | 'sent'
          scheduled_at: string | null
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          template_html?: string | null
          template_text?: string | null
          status?: 'draft' | 'scheduled' | 'sending' | 'sent'
          scheduled_at?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          template_html?: string | null
          template_text?: string | null
          status?: 'draft' | 'scheduled' | 'sending' | 'sent'
          scheduled_at?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          campaign_id: string
          email: string
          name: string
          custom_fields: Json
          status: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          email: string
          name: string
          custom_fields?: Json
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          email?: string
          name?: string
          custom_fields?: Json
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          google_oauth_token: string | null
          rate_limit_delay: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_oauth_token?: string | null
          rate_limit_delay?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_oauth_token?: string | null
          rate_limit_delay?: number
          created_at?: string
        }
      }
    }
  }
}
