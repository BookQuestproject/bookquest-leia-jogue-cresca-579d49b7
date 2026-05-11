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
      academic_diagnosis: {
        Row: {
          completed_at: string
          focus: string
          id: string
          target_exams: string[] | null
          updated_at: string
          user_id: string
          weekly_hours: number
        }
        Insert: {
          completed_at?: string
          focus: string
          id?: string
          target_exams?: string[] | null
          updated_at?: string
          user_id: string
          weekly_hours?: number
        }
        Update: {
          completed_at?: string
          focus?: string
          id?: string
          target_exams?: string[] | null
          updated_at?: string
          user_id?: string
          weekly_hours?: number
        }
        Relationships: []
      }
      available_slots: {
        Row: {
          day_of_week: number
          id: string
          is_active: boolean | null
          time_slot: string
        }
        Insert: {
          day_of_week: number
          id?: string
          is_active?: boolean | null
          time_slot: string
        }
        Update: {
          day_of_week?: number
          id?: string
          is_active?: boolean | null
          time_slot?: string
        }
        Relationships: []
      }
      book_club_content: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          file_url: string | null
          id: string
          monthly_id: string
          sort_order: number
          title: string
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by: string
          description?: string | null
          file_url?: string | null
          id?: string
          monthly_id: string
          sort_order?: number
          title: string
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_url?: string | null
          id?: string
          monthly_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_club_content_monthly_id_fkey"
            columns: ["monthly_id"]
            isOneToOne: false
            referencedRelation: "book_club_monthly"
            referencedColumns: ["id"]
          },
        ]
      }
      book_club_discussions: {
        Row: {
          chapter_ref: number | null
          club_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_ref?: number | null
          club_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_ref?: number | null
          club_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_club_discussions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      book_club_members: {
        Row: {
          club_id: string
          current_chapter: number | null
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          current_chapter?: number | null
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          current_chapter?: number | null
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      book_club_monthly: {
        Row: {
          book_author: string
          book_cover_url: string | null
          book_title: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          month_year: string
          status: string
          updated_at: string
        }
        Insert: {
          book_author: string
          book_cover_url?: string | null
          book_title: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          month_year: string
          status?: string
          updated_at?: string
        }
        Update: {
          book_author?: string
          book_cover_url?: string | null
          book_title?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          month_year?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_clubs: {
        Row: {
          book_cover: string | null
          book_id: string
          book_title: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          book_cover?: string | null
          book_id: string
          book_title: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          book_cover?: string | null
          book_id?: string
          book_title?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_overrides: {
        Row: {
          author: string | null
          book_id: string
          cover_url: string | null
          created_at: string
          description: string | null
          detailed_description: string | null
          genre: string | null
          id: string
          title: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          author?: string | null
          book_id: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          detailed_description?: string | null
          genre?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          author?: string | null
          book_id?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          detailed_description?: string | null
          genre?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      book_requests: {
        Row: {
          admin_notes: string | null
          author: string
          class_id: string | null
          created_at: string
          id: string
          notes: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_name: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          author: string
          class_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          author?: string
          class_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_reviews: {
        Row: {
          book_id: string
          book_title: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          book_title?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          book_title?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      book_suggestions: {
        Row: {
          admin_notes: string | null
          ai_verification_data: Json | null
          ai_verified: boolean | null
          approved_at: string | null
          approved_by: string | null
          author: string | null
          book_summary: string | null
          chapters_list: Json | null
          cover_url: string | null
          created_at: string
          external_link: string | null
          genre: string | null
          id: string
          narrative_context: string | null
          publication_year: number | null
          reason: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          ai_verification_data?: Json | null
          ai_verified?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          book_summary?: string | null
          chapters_list?: Json | null
          cover_url?: string | null
          created_at?: string
          external_link?: string | null
          genre?: string | null
          id?: string
          narrative_context?: string | null
          publication_year?: number | null
          reason?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          ai_verification_data?: Json | null
          ai_verified?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          book_summary?: string | null
          chapters_list?: Json | null
          cover_url?: string | null
          created_at?: string
          external_link?: string | null
          genre?: string | null
          id?: string
          narrative_context?: string | null
          publication_year?: number | null
          reason?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      book_trail_enrichments: {
        Row: {
          author: string
          book_id: string
          chapters: Json
          cover_url: string | null
          created_at: string
          genre: string | null
          id: string
          source: string
          theme_color: string | null
          title: string
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          author: string
          book_id: string
          chapters?: Json
          cover_url?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          source?: string
          theme_color?: string | null
          title: string
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          author?: string
          book_id?: string
          chapters?: Json
          cover_url?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          source?: string
          theme_color?: string | null
          title?: string
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      chapter_contributions: {
        Row: {
          admin_notes: string | null
          ai_confidence: number | null
          ai_notes: string | null
          ai_verified: boolean | null
          book_author: string | null
          book_id: string
          book_title: string
          chapters: Json
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          ai_confidence?: number | null
          ai_notes?: string | null
          ai_verified?: boolean | null
          book_author?: string | null
          book_id: string
          book_title: string
          chapters?: Json
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          ai_confidence?: number | null
          ai_notes?: string | null
          ai_verified?: boolean | null
          book_author?: string | null
          book_id?: string
          book_title?: string
          chapters?: Json
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      class_book_history: {
        Row: {
          author: string | null
          avg_progress: number | null
          book_id: string | null
          book_title: string
          class_id: string
          created_at: string
          ended_at: string
          ended_by: string
          id: string
          members_count: number | null
          started_at: string
          total_pages: number | null
        }
        Insert: {
          author?: string | null
          avg_progress?: number | null
          book_id?: string | null
          book_title: string
          class_id: string
          created_at?: string
          ended_at?: string
          ended_by: string
          id?: string
          members_count?: number | null
          started_at: string
          total_pages?: number | null
        }
        Update: {
          author?: string | null
          avg_progress?: number | null
          book_id?: string | null
          book_title?: string
          class_id?: string
          created_at?: string
          ended_at?: string
          ended_by?: string
          id?: string
          members_count?: number | null
          started_at?: string
          total_pages?: number | null
        }
        Relationships: []
      }
      class_chapter_discussions: {
        Row: {
          chapter_number: number
          chapter_title: string | null
          class_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_number: number
          chapter_title?: string | null
          class_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_number?: number
          chapter_title?: string | null
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_chapter_discussions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          last_seen_at: string | null
          student_email: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          last_seen_at?: string | null
          student_email?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          last_seen_at?: string | null
          student_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_next_book: {
        Row: {
          author: string | null
          book_id: string | null
          book_title: string
          class_id: string
          created_at: string
          created_by: string
          id: string
          scheduled_start_date: string
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          book_id?: string | null
          book_title: string
          class_id: string
          created_at?: string
          created_by: string
          id?: string
          scheduled_start_date: string
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          book_id?: string | null
          book_title?: string
          class_id?: string
          created_at?: string
          created_by?: string
          id?: string
          scheduled_start_date?: string
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      class_question_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          response_text: string
          reviewed_at: string | null
          reviewed_by: string | null
          teacher_feedback: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          response_text: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          teacher_feedback?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          response_text?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          teacher_feedback?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "class_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_questions: {
        Row: {
          chapter_number: number | null
          class_id: string
          created_at: string
          created_by: string
          id: string
          question_text: string
          updated_at: string
        }
        Insert: {
          chapter_number?: number | null
          class_id: string
          created_at?: string
          created_by: string
          id?: string
          question_text: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number | null
          class_id?: string
          created_at?: string
          created_by?: string
          id?: string
          question_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_questions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_reading_progress: {
        Row: {
          class_id: string
          created_at: string
          current_page: number
          id: string
          is_up_to_date: boolean | null
          last_read_date: string | null
          pages_read_today: number
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          current_page?: number
          id?: string
          is_up_to_date?: boolean | null
          last_read_date?: string | null
          pages_read_today?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          current_page?: number
          id?: string
          is_up_to_date?: boolean | null
          last_read_date?: string | null
          pages_read_today?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_reading_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          access_code: string
          author: string | null
          book_id: string | null
          book_title: string | null
          created_at: string
          description: string | null
          grade: string | null
          id: string
          is_active: boolean
          is_archived: boolean | null
          name: string
          reading_deadline: string | null
          reading_start_date: string | null
          school_year: number | null
          student_count_estimate: number | null
          teacher_id: string
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          access_code: string
          author?: string | null
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          description?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean | null
          name: string
          reading_deadline?: string | null
          reading_start_date?: string | null
          school_year?: number | null
          student_count_estimate?: number | null
          teacher_id: string
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          author?: string | null
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          description?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean | null
          name?: string
          reading_deadline?: string | null
          reading_start_date?: string | null
          school_year?: number | null
          student_count_estimate?: number | null
          teacher_id?: string
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          sticker: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          sticker?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          sticker?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "literary_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          likes_count: number
          reposts_count: number
          sticker: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          reposts_count?: number
          sticker?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          reposts_count?: number
          sticker?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "literary_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_class_announcements: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edu_class_announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_class_challenges: {
        Row: {
          challenge_type: string
          class_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          goal_value: number
          id: string
          is_active: boolean
          start_date: string
          title: string
        }
        Insert: {
          challenge_type?: string
          class_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string
          goal_value?: number
          id?: string
          is_active?: boolean
          start_date?: string
          title: string
        }
        Update: {
          challenge_type?: string
          class_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          goal_value?: number
          id?: string
          is_active?: boolean
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "edu_class_challenges_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_journey_chapter_questions: {
        Row: {
          chapter_number: number
          created_at: string
          created_by: string
          id: string
          journey_id: string
          question_text: string
          updated_at: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          created_by: string
          id?: string
          journey_id: string
          question_text: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          created_by?: string
          id?: string
          journey_id?: string
          question_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edu_journey_chapter_questions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "edu_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_journey_classes: {
        Row: {
          assigned_at: string
          class_id: string
          id: string
          journey_id: string
        }
        Insert: {
          assigned_at?: string
          class_id: string
          id?: string
          journey_id: string
        }
        Update: {
          assigned_at?: string
          class_id?: string
          id?: string
          journey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edu_journey_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edu_journey_classes_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "edu_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_journeys: {
        Row: {
          author: string | null
          book_id: string | null
          book_title: string | null
          created_at: string
          description: string | null
          id: string
          teacher_id: string
          title: string
          total_chapters: number
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          description?: string | null
          id?: string
          teacher_id: string
          title: string
          total_chapters?: number
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          description?: string | null
          id?: string
          teacher_id?: string
          title?: string
          total_chapters?: number
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      edu_reports: {
        Row: {
          analysis_text: string | null
          class_id: string
          created_at: string
          id: string
          metrics: Json
          pdf_url: string | null
          period_label: string | null
          sent_at: string | null
          status: string
          student_user_id: string
          teacher_id: string
          teacher_note: string | null
          updated_at: string
        }
        Insert: {
          analysis_text?: string | null
          class_id: string
          created_at?: string
          id?: string
          metrics?: Json
          pdf_url?: string | null
          period_label?: string | null
          sent_at?: string | null
          status?: string
          student_user_id: string
          teacher_id: string
          teacher_note?: string | null
          updated_at?: string
        }
        Update: {
          analysis_text?: string | null
          class_id?: string
          created_at?: string
          id?: string
          metrics?: Json
          pdf_url?: string | null
          period_label?: string | null
          sent_at?: string | null
          status?: string
          student_user_id?: string
          teacher_id?: string
          teacher_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edu_reports_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_student_achievements: {
        Row: {
          achievement_label: string
          achievement_type: string
          awarded_at: string
          class_id: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_label: string
          achievement_type: string
          awarded_at?: string
          class_id: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_label?: string
          achievement_type?: string
          awarded_at?: string
          class_id?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edu_student_achievements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_teacher_settings: {
        Row: {
          created_at: string
          email_settings: Json
          notification_prefs: Json
          school_name: string | null
          signature: string | null
          teacher_id: string
          updated_at: string
          visual_prefs: Json
        }
        Insert: {
          created_at?: string
          email_settings?: Json
          notification_prefs?: Json
          school_name?: string | null
          signature?: string | null
          teacher_id: string
          updated_at?: string
          visual_prefs?: Json
        }
        Update: {
          created_at?: string
          email_settings?: Json
          notification_prefs?: Json
          school_name?: string | null
          signature?: string | null
          teacher_id?: string
          updated_at?: string
          visual_prefs?: Json
        }
        Relationships: []
      }
      edu_teachers: {
        Row: {
          activated_at: string
          activation_code: string
          id: string
          onboarding_completed: boolean
          profile_completed: boolean
          user_id: string
        }
        Insert: {
          activated_at?: string
          activation_code: string
          id?: string
          onboarding_completed?: boolean
          profile_completed?: boolean
          user_id: string
        }
        Update: {
          activated_at?: string
          activation_code?: string
          id?: string
          onboarding_completed?: boolean
          profile_completed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      founder_subscriptions: {
        Row: {
          id: string
          is_active: boolean
          purchased_at: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          purchased_at?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          purchased_at?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      group_session_participants: {
        Row: {
          attended: boolean | null
          enrolled_at: string | null
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          enrolled_at?: string | null
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          enrolled_at?: string | null
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_group_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      literary_communities: {
        Row: {
          author: string
          book_id: string
          cover: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          author: string
          book_id: string
          cover?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          author?: string
          book_id?: string
          cover?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      mentor_tracks: {
        Row: {
          id: string
          mentor_id: string
          track_id: string
        }
        Insert: {
          id?: string
          mentor_id: string
          track_id: string
        }
        Update: {
          id?: string
          mentor_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_tracks_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mentorship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mentorship_group_sessions: {
        Row: {
          created_at: string | null
          id: string
          max_participants: number | null
          mentor_id: string | null
          min_participants: number | null
          notes: string | null
          session_date: string
          session_time: string
          status: string | null
          track_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_participants?: number | null
          mentor_id?: string | null
          min_participants?: number | null
          notes?: string | null
          session_date: string
          session_time: string
          status?: string | null
          track_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_participants?: number | null
          mentor_id?: string | null
          min_participants?: number | null
          notes?: string | null
          session_date?: string
          session_time?: string
          status?: string | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_group_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_group_sessions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "mentorship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          session_date: string
          session_time: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          session_date: string
          session_time: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          session_date?: string
          session_time?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      mentorship_tracks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          objectives: string[] | null
          slug: string
          updated_at: string | null
          weekly_script: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          objectives?: string[] | null
          slug: string
          updated_at?: string | null
          weekly_script?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          objectives?: string[] | null
          slug?: string
          updated_at?: string | null
          weekly_script?: Json | null
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_read_status: {
        Row: {
          id: string
          news_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          news_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          news_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_read_status_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_character: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          edu_onboarding_completed: boolean
          email: string | null
          full_name: string | null
          grades_taught: string[] | null
          id: string
          is_premium: boolean | null
          literary_profile: Json | null
          premium_expires_at: string | null
          quiz_completed: boolean | null
          referral_code: string | null
          school_name: string | null
          state: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_character?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          edu_onboarding_completed?: boolean
          email?: string | null
          full_name?: string | null
          grades_taught?: string[] | null
          id: string
          is_premium?: boolean | null
          literary_profile?: Json | null
          premium_expires_at?: string | null
          quiz_completed?: boolean | null
          referral_code?: string | null
          school_name?: string | null
          state?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_character?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          edu_onboarding_completed?: boolean
          email?: string | null
          full_name?: string | null
          grades_taught?: string[] | null
          id?: string
          is_premium?: boolean | null
          literary_profile?: Json | null
          premium_expires_at?: string | null
          quiz_completed?: boolean | null
          referral_code?: string | null
          school_name?: string | null
          state?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reading_plans: {
        Row: {
          book_id: string
          book_title: string | null
          created_at: string
          current_day: number
          daily_minutes: number
          daily_pages: number
          id: string
          is_active: boolean
          total_pages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          book_title?: string | null
          created_at?: string
          current_day?: number
          daily_minutes: number
          daily_pages: number
          id?: string
          is_active?: boolean
          total_pages: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          book_title?: string | null
          created_at?: string
          current_day?: number
          daily_minutes?: number
          daily_pages?: number
          id?: string
          is_active?: boolean
          total_pages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          chapter_id: string
          created_at: string
          current_page: number | null
          elapsed_time: number
          id: string
          is_completed: boolean
          is_partial: boolean
          is_paused: boolean
          notes: string | null
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          created_at?: string
          current_page?: number | null
          elapsed_time?: number
          id?: string
          is_completed?: boolean
          is_partial?: boolean
          is_paused?: boolean
          notes?: string | null
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          created_at?: string
          current_page?: number | null
          elapsed_time?: number
          id?: string
          is_completed?: boolean
          is_partial?: boolean
          is_paused?: boolean
          notes?: string | null
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referred_reward_claimed: boolean
          referrer_id: string
          referrer_reward_claimed: boolean
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referred_reward_claimed?: boolean
          referrer_id: string
          referrer_reward_claimed?: boolean
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referred_reward_claimed?: boolean
          referrer_id?: string
          referrer_reward_claimed?: boolean
          status?: string
        }
        Relationships: []
      }
      social_challenges: {
        Row: {
          challenge_type: string
          challenged_id: string
          challenged_progress: number
          challenger_id: string
          challenger_progress: number
          created_at: string
          description: string | null
          expires_at: string | null
          goal_value: number
          id: string
          status: string
          title: string
          updated_at: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          challenge_type: string
          challenged_id: string
          challenged_progress?: number
          challenger_id: string
          challenger_progress?: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          goal_value?: number
          id?: string
          status?: string
          title: string
          updated_at?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          challenged_id?: string
          challenged_progress?: number
          challenger_id?: string
          challenger_progress?: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          goal_value?: number
          id?: string
          status?: string
          title?: string
          updated_at?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      streak_freezes: {
        Row: {
          id: string
          quantity: number
          updated_at: string
          used_dates: string[] | null
          user_id: string
        }
        Insert: {
          id?: string
          quantity?: number
          updated_at?: string
          used_dates?: string[] | null
          user_id: string
        }
        Update: {
          id?: string
          quantity?: number
          updated_at?: string
          used_dates?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_label: string
          badge_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_label: string
          badge_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_label?: string
          badge_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_book_structure: {
        Row: {
          book_id: string
          created_at: string
          id: string
          mode: string
          session_size: number | null
          total_chapters: number | null
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          mode?: string
          session_size?: number | null
          total_chapters?: number | null
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          mode?: string
          session_size?: number | null
          total_chapters?: number | null
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_titles: {
        Row: {
          awarded_at: string
          id: string
          is_active: boolean
          title: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          id?: string
          is_active?: boolean
          title: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          id?: string
          is_active?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary: {
        Row: {
          book_id: string | null
          book_title: string | null
          created_at: string
          definition: string
          example: string | null
          id: string
          synonyms: string[] | null
          user_id: string
          word: string
        }
        Insert: {
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          definition: string
          example?: string | null
          id?: string
          synonyms?: string[] | null
          user_id: string
          word: string
        }
        Update: {
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          definition?: string
          example?: string | null
          id?: string
          synonyms?: string[] | null
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          assigned_tier: string
          created_at: string
          id: string
          last_streak_date: string | null
          last_week_reset: string | null
          streak: number
          updated_at: string
          user_id: string
          week_xp: number
          xp: number
        }
        Insert: {
          assigned_tier?: string
          created_at?: string
          id?: string
          last_streak_date?: string | null
          last_week_reset?: string | null
          streak?: number
          updated_at?: string
          user_id: string
          week_xp?: number
          xp?: number
        }
        Update: {
          assigned_tier?: string
          created_at?: string
          id?: string
          last_streak_date?: string | null
          last_week_reset?: string | null
          streak?: number
          updated_at?: string
          user_id?: string
          week_xp?: number
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_teacher_with_code: { Args: { _code: string }; Returns: boolean }
      award_badge: {
        Args: {
          _badge_label: string
          _badge_type: string
          _metadata?: Json
          _user_id: string
        }
        Returns: undefined
      }
      find_class_by_code: {
        Args: { _code: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      find_user_by_email: { Args: { _email: string }; Returns: string }
      find_user_by_handle: {
        Args: { _handle: string }
        Returns: {
          email: string
          full_name: string
          id: string
          username: string
        }[]
      }
      generate_class_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_founder_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_class_member: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_class_teacher: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_journey_member: {
        Args: { _journey_id: string; _user_id: string }
        Returns: boolean
      }
      is_journey_teacher: {
        Args: { _journey_id: string; _user_id: string }
        Returns: boolean
      }
      student_join_class_by_code: {
        Args: { _code: string; _email?: string }
        Returns: string
      }
      teacher_add_student_to_class: {
        Args: { _class_id: string; _student_user_id: string }
        Returns: boolean
      }
      tick_user_streak: {
        Args: { _user_id: string }
        Returns: {
          streak: number
          was_updated: boolean
        }[]
      }
      touch_class_member_seen: {
        Args: { _class_id: string }
        Returns: undefined
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
