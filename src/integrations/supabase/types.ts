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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_matches: {
        Row: {
          case_id: string
          created_at: string
          id: string
          lawyer_id: string
          match_reasons: string[] | null
          match_score: number
          responded_at: string | null
          status: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          lawyer_id: string
          match_reasons?: string[] | null
          match_score?: number
          responded_at?: string | null
          status?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          lawyer_id?: string
          match_reasons?: string[] | null
          match_score?: number
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_matches_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_messages: {
        Row: {
          case_id: string
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          message: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          lawyer_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          lawyer_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          lawyer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          accepted_at: string | null
          auto_assigned: boolean | null
          case_number: string | null
          case_stage: string | null
          case_type: string
          client_id: string
          client_location_city: string | null
          client_location_state: string | null
          closed_at: string | null
          court_name: string | null
          created_at: string
          description: string
          id: string
          lawyer_id: string | null
          match_status: string | null
          next_hearing_date: string | null
          opponent_contact: string | null
          opponent_name: string | null
          preferred_consultation: string | null
          priority: string | null
          response_deadline: string | null
          status: string
          title: string
          updated_at: string
          workspace_client_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          auto_assigned?: boolean | null
          case_number?: string | null
          case_stage?: string | null
          case_type: string
          client_id: string
          client_location_city?: string | null
          client_location_state?: string | null
          closed_at?: string | null
          court_name?: string | null
          created_at?: string
          description: string
          id?: string
          lawyer_id?: string | null
          match_status?: string | null
          next_hearing_date?: string | null
          opponent_contact?: string | null
          opponent_name?: string | null
          preferred_consultation?: string | null
          priority?: string | null
          response_deadline?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_client_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          auto_assigned?: boolean | null
          case_number?: string | null
          case_stage?: string | null
          case_type?: string
          client_id?: string
          client_location_city?: string | null
          client_location_state?: string | null
          closed_at?: string | null
          court_name?: string | null
          created_at?: string
          description?: string
          id?: string
          lawyer_id?: string | null
          match_status?: string | null
          next_hearing_date?: string | null
          opponent_contact?: string | null
          opponent_name?: string | null
          preferred_consultation?: string | null
          priority?: string | null
          response_deadline?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_client_id?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      consultant_bookings: {
        Row: {
          client_id: string
          consultant_id: string
          consultation_type: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          topic: string | null
        }
        Insert: {
          client_id: string
          consultant_id: string
          consultation_type?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          topic?: string | null
        }
        Update: {
          client_id?: string
          consultant_id?: string
          consultation_type?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultant_bookings_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          avatar_url: string | null
          city: string | null
          consultation_fee: number
          created_at: string
          description: string | null
          email: string | null
          experience: number
          expertise: string[] | null
          id: string
          is_active: boolean
          languages: string[] | null
          name: string
          phone: string | null
          qualification: string | null
          rating: number
          specialization: string
          state: string | null
          total_reviews: number
          verified: boolean
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          consultation_fee?: number
          created_at?: string
          description?: string | null
          email?: string | null
          experience?: number
          expertise?: string[] | null
          id?: string
          is_active?: boolean
          languages?: string[] | null
          name: string
          phone?: string | null
          qualification?: string | null
          rating?: number
          specialization: string
          state?: string | null
          total_reviews?: number
          verified?: boolean
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          consultation_fee?: number
          created_at?: string
          description?: string | null
          email?: string | null
          experience?: number
          expertise?: string[] | null
          id?: string
          is_active?: boolean
          languages?: string[] | null
          name?: string
          phone?: string | null
          qualification?: string | null
          rating?: number
          specialization?: string
          state?: string | null
          total_reviews?: number
          verified?: boolean
        }
        Relationships: []
      }
      consultations: {
        Row: {
          case_id: string | null
          client_feedback: string | null
          client_id: string
          client_rating: number | null
          completed_at: string | null
          consultation_type: string
          created_at: string
          decline_reason: string | null
          duration_minutes: number
          id: string
          lawyer_id: string
          lawyer_notes: string | null
          meeting_link: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          suggested_date: string | null
          suggested_time: string | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_feedback?: string | null
          client_id: string
          client_rating?: number | null
          completed_at?: string | null
          consultation_type?: string
          created_at?: string
          decline_reason?: string | null
          duration_minutes?: number
          id?: string
          lawyer_id: string
          lawyer_notes?: string | null
          meeting_link?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          suggested_date?: string | null
          suggested_time?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_feedback?: string | null
          client_id?: string
          client_rating?: number | null
          completed_at?: string | null
          consultation_type?: string
          created_at?: string
          decline_reason?: string | null
          duration_minutes?: number
          id?: string
          lawyer_id?: string
          lawyer_notes?: string | null
          meeting_link?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          suggested_date?: string | null
          suggested_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_lawyers: {
        Row: {
          available_days: string[] | null
          available_end_time: string | null
          available_start_time: string | null
          avatar_url: string | null
          bar_council_number: string
          bio: string | null
          case_stats: Json | null
          city: string | null
          consultation_duration: number
          consultation_fee: number
          consultation_types: string[] | null
          court_jurisdictions: string[] | null
          created_at: string
          education: Json | null
          email: string | null
          experience: number
          id: string
          is_active: boolean
          languages_spoken: string[] | null
          law_firm: string | null
          name: string
          phone: string | null
          practice_areas: string[] | null
          rating: number
          role_type: string
          specialization: string | null
          state: string | null
          tagline: string | null
          total_cases: number
          total_reviews: number
          year_of_practice: number
        }
        Insert: {
          available_days?: string[] | null
          available_end_time?: string | null
          available_start_time?: string | null
          avatar_url?: string | null
          bar_council_number: string
          bio?: string | null
          case_stats?: Json | null
          city?: string | null
          consultation_duration?: number
          consultation_fee?: number
          consultation_types?: string[] | null
          court_jurisdictions?: string[] | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience: number
          id?: string
          is_active?: boolean
          languages_spoken?: string[] | null
          law_firm?: string | null
          name: string
          phone?: string | null
          practice_areas?: string[] | null
          rating?: number
          role_type?: string
          specialization?: string | null
          state?: string | null
          tagline?: string | null
          total_cases?: number
          total_reviews?: number
          year_of_practice: number
        }
        Update: {
          available_days?: string[] | null
          available_end_time?: string | null
          available_start_time?: string | null
          avatar_url?: string | null
          bar_council_number?: string
          bio?: string | null
          case_stats?: Json | null
          city?: string | null
          consultation_duration?: number
          consultation_fee?: number
          consultation_types?: string[] | null
          court_jurisdictions?: string[] | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: number
          id?: string
          is_active?: boolean
          languages_spoken?: string[] | null
          law_firm?: string | null
          name?: string
          phone?: string | null
          practice_areas?: string[] | null
          rating?: number
          role_type?: string
          specialization?: string | null
          state?: string | null
          tagline?: string | null
          total_cases?: number
          total_reviews?: number
          year_of_practice?: number
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          message: string
          recipient_id: string
          recipient_type: string
          sender_id: string
          status: string
          subject: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          message: string
          recipient_id: string
          recipient_type: string
          sender_id: string
          status?: string
          subject?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string
          recipient_id?: string
          recipient_type?: string
          sender_id?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      lawyer_case_stats: {
        Row: {
          case_category: string
          cases_handled: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          case_category: string
          cases_handled?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          case_category?: string
          cases_handled?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      lawyer_clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          id_proof_url: string | null
          lawyer_id: string
          linked_user_id: string | null
          name: string
          notes: string | null
          payment_status: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          id_proof_url?: string | null
          lawyer_id: string
          linked_user_id?: string | null
          name: string
          notes?: string | null
          payment_status?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          id_proof_url?: string | null
          lawyer_id?: string
          linked_user_id?: string | null
          name?: string
          notes?: string | null
          payment_status?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lawyer_documents: {
        Row: {
          admin_notes: string | null
          document_type: string
          file_name: string
          file_url: string
          id: string
          status: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          document_type: string
          file_name: string
          file_url: string
          id?: string
          status?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          status?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lawyer_education: {
        Row: {
          certifications: string | null
          created_at: string
          degree: string
          graduation_year: number
          id: string
          university: string
          user_id: string
        }
        Insert: {
          certifications?: string | null
          created_at?: string
          degree: string
          graduation_year: number
          id?: string
          university: string
          user_id: string
        }
        Update: {
          certifications?: string | null
          created_at?: string
          degree?: string
          graduation_year?: number
          id?: string
          university?: string
          user_id?: string
        }
        Relationships: []
      }
      lawyer_profiles: {
        Row: {
          available_days: string[] | null
          available_end_time: string | null
          available_start_time: string | null
          bar_council_number: string
          bio: string | null
          consultation_duration: number | null
          consultation_fee: number | null
          consultation_types: string[] | null
          court_jurisdictions: string[] | null
          created_at: string
          experience: number | null
          id: string
          languages_spoken: string[] | null
          law_firm: string | null
          max_active_cases: number | null
          practice_areas: string[]
          profile_visible: boolean | null
          rating: number | null
          role_type: Database["public"]["Enums"]["lawyer_role_type"]
          specialization: string | null
          tagline: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["lawyer_verification_status"]
          verified_at: string | null
          year_of_practice: number
        }
        Insert: {
          available_days?: string[] | null
          available_end_time?: string | null
          available_start_time?: string | null
          bar_council_number: string
          bio?: string | null
          consultation_duration?: number | null
          consultation_fee?: number | null
          consultation_types?: string[] | null
          court_jurisdictions?: string[] | null
          created_at?: string
          experience?: number | null
          id?: string
          languages_spoken?: string[] | null
          law_firm?: string | null
          max_active_cases?: number | null
          practice_areas?: string[]
          profile_visible?: boolean | null
          rating?: number | null
          role_type?: Database["public"]["Enums"]["lawyer_role_type"]
          specialization?: string | null
          tagline?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["lawyer_verification_status"]
          verified_at?: string | null
          year_of_practice?: number
        }
        Update: {
          available_days?: string[] | null
          available_end_time?: string | null
          available_start_time?: string | null
          bar_council_number?: string
          bio?: string | null
          consultation_duration?: number | null
          consultation_fee?: number | null
          consultation_types?: string[] | null
          court_jurisdictions?: string[] | null
          created_at?: string
          experience?: number | null
          id?: string
          languages_spoken?: string[] | null
          law_firm?: string | null
          max_active_cases?: number | null
          practice_areas?: string[]
          profile_visible?: boolean | null
          rating?: number | null
          role_type?: Database["public"]["Enums"]["lawyer_role_type"]
          specialization?: string | null
          tagline?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["lawyer_verification_status"]
          verified_at?: string | null
          year_of_practice?: number
        }
        Relationships: []
      }
      lawyer_reviews: {
        Row: {
          admin_moderated: boolean
          case_id: string | null
          client_id: string
          communication_rating: number | null
          consultation_id: string | null
          created_at: string
          flag_reason: string | null
          id: string
          is_flagged: boolean
          is_verified: boolean
          knowledge_rating: number | null
          lawyer_id: string
          overall_rating: number
          professionalism_rating: number | null
          responsiveness_rating: number | null
          review_text: string | null
          updated_at: string
        }
        Insert: {
          admin_moderated?: boolean
          case_id?: string | null
          client_id: string
          communication_rating?: number | null
          consultation_id?: string | null
          created_at?: string
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          is_verified?: boolean
          knowledge_rating?: number | null
          lawyer_id: string
          overall_rating: number
          professionalism_rating?: number | null
          responsiveness_rating?: number | null
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          admin_moderated?: boolean
          case_id?: string | null
          client_id?: string
          communication_rating?: number | null
          consultation_id?: string | null
          created_at?: string
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          is_verified?: boolean
          knowledge_rating?: number | null
          lawyer_id?: string
          overall_rating?: number
          professionalism_rating?: number | null
          responsiveness_rating?: number | null
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_reviews_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_team_members: {
        Row: {
          created_at: string
          id: string
          lawyer_id: string
          member_user_id: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          lawyer_id: string
          member_user_id: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          lawyer_id?: string
          member_user_id?: string
          role?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_case_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_case_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_case_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_case_id_fkey"
            columns: ["related_case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          preferred_language: string | null
          state: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          id: string
          name?: string
          phone?: string | null
          preferred_language?: string | null
          state?: string | null
          updated_at?: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          preferred_language?: string | null
          state?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_audit_log: {
        Row: {
          action: string
          actor_id: string
          case_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          lawyer_id: string
        }
        Insert: {
          action: string
          actor_id: string
          case_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          lawyer_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          case_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          lawyer_id?: string
        }
        Relationships: []
      }
      workspace_document_versions: {
        Row: {
          case_id: string
          created_at: string
          document_id: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          lawyer_id: string
          tag: string | null
          uploaded_by: string
          version_number: number
        }
        Insert: {
          case_id: string
          created_at?: string
          document_id?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          lawyer_id: string
          tag?: string | null
          uploaded_by: string
          version_number?: number
        }
        Update: {
          case_id?: string
          created_at?: string
          document_id?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          lawyer_id?: string
          tag?: string | null
          uploaded_by?: string
          version_number?: number
        }
        Relationships: []
      }
      workspace_hearings: {
        Row: {
          case_id: string
          court_name: string | null
          court_room: string | null
          created_at: string
          hearing_date: string
          hearing_time: string | null
          id: string
          judge_name: string | null
          lawyer_id: string
          notes: string | null
          outcome: string | null
          purpose: string | null
          status: string
          updated_at: string
        }
        Insert: {
          case_id: string
          court_name?: string | null
          court_room?: string | null
          created_at?: string
          hearing_date: string
          hearing_time?: string | null
          id?: string
          judge_name?: string | null
          lawyer_id: string
          notes?: string | null
          outcome?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          court_name?: string | null
          court_room?: string | null
          created_at?: string
          hearing_date?: string
          hearing_time?: string | null
          id?: string
          judge_name?: string | null
          lawyer_id?: string
          notes?: string | null
          outcome?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      workspace_tasks: {
        Row: {
          assignee_id: string | null
          case_id: string
          checklist: Json | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          lawyer_id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          case_id: string
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          lawyer_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          case_id?: string
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          lawyer_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      lawyer_reviews_moderation: {
        Row: {
          admin_moderated: boolean | null
          client_id: string | null
          flag_reason: string | null
          id: string | null
          is_flagged: boolean | null
          lawyer_id: string | null
        }
        Insert: {
          admin_moderated?: boolean | null
          client_id?: string | null
          flag_reason?: string | null
          id?: string | null
          is_flagged?: boolean | null
          lawyer_id?: string | null
        }
        Update: {
          admin_moderated?: boolean | null
          client_id?: string | null
          flag_reason?: string | null
          id?: string | null
          is_flagged?: boolean | null
          lawyer_id?: string | null
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
      is_lawyer_team_member: {
        Args: { _lawyer_id: string; _user_id: string }
        Returns: boolean
      }
      team_lawyer_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "junior"
      lawyer_role_type:
        | "junior_lawyer"
        | "advocate"
        | "senior_advocate"
        | "legal_consultant"
      lawyer_verification_status:
        | "pending"
        | "under_review"
        | "verified"
        | "rejected"
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
      app_role: ["admin", "moderator", "user", "junior"],
      lawyer_role_type: [
        "junior_lawyer",
        "advocate",
        "senior_advocate",
        "legal_consultant",
      ],
      lawyer_verification_status: [
        "pending",
        "under_review",
        "verified",
        "rejected",
      ],
    },
  },
} as const
