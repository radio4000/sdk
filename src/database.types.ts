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
      accounts: {
        Row: {
          color_scheme: string | null
          created_at: string
          id: string
          theme: string | null
          updated_at: string
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string
          id: string
          theme?: string | null
          updated_at?: string
        }
        Update: {
          color_scheme?: string | null
          created_at?: string
          id?: string
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      broadcast: {
        Row: {
          channel_id: string
          created_at: string
          decks: Json | null
          track_id: string | null
          track_played_at: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          decks?: Json | null
          track_id?: string | null
          track_played_at: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          decks?: Json | null
          track_id?: string | null
          track_played_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels_with_tracks_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "orphaned_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "random_channels_with_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_track: {
        Row: {
          channel_id: string
          created_at: string
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_track_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "orphaned_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "random_channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "channel_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "orphaned_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_track_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          coordinates: unknown
          created_at: string
          description: string | null
          favorites: string[] | null
          firebase_id: string | null
          followers: string[] | null
          fts: unknown
          id: string
          image: string | null
          latitude: number | null
          longitude: number | null
          name: string
          slug: string
          updated_at: string
          url: string | null
        }
        Insert: {
          coordinates?: unknown
          created_at?: string
          description?: string | null
          favorites?: string[] | null
          firebase_id?: string | null
          followers?: string[] | null
          fts?: unknown
          id?: string
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          slug: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string
          description?: string | null
          favorites?: string[] | null
          firebase_id?: string | null
          followers?: string[] | null
          fts?: unknown
          id?: string
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          slug?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      followers: {
        Row: {
          channel_id: string
          created_at: string
          follower_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          follower_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "orphaned_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "random_channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "channels_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "orphaned_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "random_channels_with_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      reserved_slugs: {
        Row: {
          created_at: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          slug?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          created_at: string
          description: string | null
          discogs_url: string | null
          duration: number | null
          fts: unknown
          id: string
          media_id: string | null
          mentions: string[] | null
          playback_error: string | null
          provider: string | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discogs_url?: string | null
          duration?: number | null
          fts?: unknown
          id?: string
          media_id?: string | null
          mentions?: string[] | null
          playback_error?: string | null
          provider?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discogs_url?: string | null
          duration?: number | null
          fts?: unknown
          id?: string
          media_id?: string | null
          mentions?: string[] | null
          playback_error?: string | null
          provider?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_channel: {
        Row: {
          channel_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels_with_tracks_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "orphaned_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "random_channels_with_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      channel_tracks: {
        Row: {
          created_at: string | null
          description: string | null
          discogs_url: string | null
          duration: number | null
          fts: unknown
          id: string | null
          media_id: string | null
          mentions: string[] | null
          playback_error: string | null
          provider: string | null
          slug: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          url: string | null
        }
        Relationships: []
      }
      channels_explore: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          favorites: string[] | null
          firebase_id: string | null
          followers: string[] | null
          fts: unknown
          id: string | null
          image: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          track_count: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: []
      }
      channels_with_tracks: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          favorites: string[] | null
          firebase_id: string | null
          followers: string[] | null
          fts: unknown
          id: string | null
          image: string | null
          latest_track_at: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          track_count: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: []
      }
      channels_with_tracks_v1: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          favorites: string[] | null
          firebase_id: string | null
          followers: string[] | null
          fts: unknown
          id: string | null
          image: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          track_count: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: []
      }
      orphaned_channels: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          favorites: string[] | null
          firebase_id: string | null
          followers: string[] | null
          fts: unknown
          id: string | null
          image: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          favorites?: string[] | null
          firebase_id?: string | null
          followers?: string[] | null
          fts?: unknown
          id?: string | null
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          slug?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          favorites?: string[] | null
          firebase_id?: string | null
          followers?: string[] | null
          fts?: unknown
          id?: string | null
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          slug?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      orphaned_tracks: {
        Row: {
          created_at: string | null
          description: string | null
          discogs_url: string | null
          fts: unknown
          id: string | null
          mentions: string[] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discogs_url?: string | null
          fts?: unknown
          id?: string | null
          mentions?: string[] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discogs_url?: string | null
          fts?: unknown
          id?: string | null
          mentions?: string[] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      random_channels_with_tracks: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          favorites: string[] | null
          firebase_id: string | null
          followers: string[] | null
          fts: unknown
          id: string | null
          image: string | null
          latest_track_at: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          track_count: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      ban_user: {
        Args: { ban_until?: string; target_user_id: string }
        Returns: undefined
      }
      ban_user_by_channel_slug: {
        Args: { ban_until?: string; channel_slug: string }
        Returns: undefined
      }
      delete_user: { Args: never; Returns: undefined }
      is_banned: { Args: never; Returns: boolean }
      parse_tokens: {
        Args: { content: string; prefix: string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
