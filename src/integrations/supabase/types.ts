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
      chapbook_saves: {
        Row: {
          chapbook_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapbook_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapbook_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapbook_saves_chapbook_id_fkey"
            columns: ["chapbook_id"]
            isOneToOne: false
            referencedRelation: "chapbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      chapbooks: {
        Row: {
          country: string | null
          cover_url: string | null
          created_at: string
          currency: string | null
          description: string | null
          external_links: Json
          format: string
          genre_tags: string[]
          id: string
          is_free: boolean
          poet_name: string
          price: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          external_links?: Json
          format: string
          genre_tags?: string[]
          id?: string
          is_free?: boolean
          poet_name: string
          price?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          external_links?: Json
          format?: string
          genre_tags?: string[]
          id?: string
          is_free?: boolean
          poet_name?: string
          price?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          poem_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          poem_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          poem_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
        ]
      }
      event_saves: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_saves_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          date: string
          description: string
          end_time: string | null
          event_type: string
          id: string
          is_featured: boolean
          is_free: boolean
          is_online: boolean
          location: string | null
          online_link: string | null
          organizer_contact: string | null
          organizer_name: string | null
          short_description: string | null
          start_time: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          date: string
          description: string
          end_time?: string | null
          event_type: string
          id?: string
          is_featured?: boolean
          is_free?: boolean
          is_online?: boolean
          location?: string | null
          online_link?: string | null
          organizer_contact?: string | null
          organizer_name?: string | null
          short_description?: string | null
          start_time?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          date?: string
          description?: string
          end_time?: string | null
          event_type?: string
          id?: string
          is_featured?: boolean
          is_free?: boolean
          is_online?: boolean
          location?: string | null
          online_link?: string | null
          organizer_contact?: string | null
          organizer_name?: string | null
          short_description?: string | null
          start_time?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      introduction_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          introduction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          introduction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          introduction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "introduction_reactions_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      introductions: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean
          poem_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          poem_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          poem_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
        ]
      }
      poem_audio_files: {
        Row: {
          created_at: string
          id: string
          poem_id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poem_id: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poem_id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poem_audio_files_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: true
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
        ]
      }
      poem_reads: {
        Row: {
          created_at: string
          id: string
          poem_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          poem_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          poem_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poem_reads_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
        ]
      }
      poem_saves: {
        Row: {
          created_at: string
          id: string
          poem_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poem_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poem_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poem_saves_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
        ]
      }
      poem_upvotes: {
        Row: {
          created_at: string
          id: string
          poem_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poem_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poem_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poem_upvotes_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
        ]
      }
      poems: {
        Row: {
          content: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["poem_status"]
          tags: string[]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["poem_status"]
          tags?: string[]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["poem_status"]
          tags?: string[]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          links: Json
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          links?: Json
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          links?: Json
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      trail_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          current_step: number
          id: string
          started_at: string
          trail_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          current_step?: number
          id?: string
          started_at?: string
          trail_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          current_step?: number
          id?: string
          started_at?: string
          trail_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_progress_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_reviews: {
        Row: {
          comment: string | null
          created_at: string
          emotion: string | null
          favorite_step_id: string | null
          id: string
          trail_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          emotion?: string | null
          favorite_step_id?: string | null
          id?: string
          trail_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          emotion?: string | null
          favorite_step_id?: string | null
          id?: string
          trail_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_reviews_favorite_step_id_fkey"
            columns: ["favorite_step_id"]
            isOneToOne: false
            referencedRelation: "trail_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trail_reviews_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_step_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          trail_step_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          trail_step_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          trail_step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_step_reactions_trail_step_id_fkey"
            columns: ["trail_step_id"]
            isOneToOne: false
            referencedRelation: "trail_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_steps: {
        Row: {
          created_at: string
          id: string
          poem_id: string
          step_order: number
          trail_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poem_id: string
          step_order: number
          trail_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poem_id?: string
          step_order?: number
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_steps_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trail_steps_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      trails: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          curation_note: string | null
          description: string | null
          id: string
          mood: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string
          curation_note?: string | null
          description?: string | null
          id?: string
          mood?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          curation_note?: string | null
          description?: string | null
          id?: string
          mood?: string | null
          status?: string
          title?: string
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
      app_role: "user" | "poet" | "moderator" | "admin"
      poem_status: "draft" | "published"
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
      app_role: ["user", "poet", "moderator", "admin"],
      poem_status: ["draft", "published"],
    },
  },
} as const
