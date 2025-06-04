export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          name: string
          created_at: string
          updated_at: string
          last_login: string | null
          has_baseline_resume: boolean
          is_active: boolean
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          has_baseline_resume?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          has_baseline_resume?: boolean
          is_active?: boolean
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          file_name: string
          file_url: string | null
          content: string
          is_ai_generated: boolean
          created_at: string
          updated_at: string
          expires_at: string | null
          job_title: string | null
          company: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          file_name: string
          file_url?: string | null
          content: string
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
          expires_at?: string | null
          job_title?: string | null
          company?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          file_name?: string
          file_url?: string | null
          content?: string
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
          expires_at?: string | null
          job_title?: string | null
          company?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          location: string | null
          description: string | null
          status: string
          url: string | null
          created_at: string
          updated_at: string
          applied_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          location?: string | null
          description?: string | null
          status?: string
          url?: string | null
          created_at?: string
          updated_at?: string
          applied_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          location?: string | null
          description?: string | null
          status?: string
          url?: string | null
          created_at?: string
          updated_at?: string
          applied_at?: string | null
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          job_id: string | null
          name: string
          content: string
          is_ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id?: string | null
          name: string
          content: string
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string | null
          name?: string
          content?: string
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      job_events: {
        Row: {
          id: string
          job_id: string
          event_type: string
          title: string
          description: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          event_type: string
          title: string
          description?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          event_type?: string
          title?: string
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
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
