export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
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
          job_id: string | null
          parent_resume_id: string | null
          version_name: string | null
          is_base: boolean
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
          job_id?: string | null
          parent_resume_id?: string | null
          version_name?: string | null
          is_base?: boolean
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
          job_id?: string | null
          parent_resume_id?: string | null
          version_name?: string | null
          is_base?: boolean
        }
      }
      job_resumes: {
        Row: {
          id: string
          job_id: string
          resume_id: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          resume_id: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          resume_id?: string
          created_at?: string
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
      job_status: "saved" | "applied" | "interviewing" | "offered" | "rejected" | "accepted" | "declined"
      event_type: "application" | "interview" | "offer" | "rejection" | "acceptance" | "note"
    }
  }
}
