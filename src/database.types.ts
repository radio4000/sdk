export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          id: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          theme?: string | null
          updated_at?: string | null
        }
      }
      channel_track: {
        Row: {
          channel_id: string
          created_at: string | null
          track_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          track_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          track_id?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      channels: {
        Row: {
          coordinates: unknown | null
          created_at: string | null
          description: string | null
          fts: unknown | null
          id: string
          image: string | null
          latitude: number | null
          longitude: number | null
          name: string
          slug: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          fts?: unknown | null
          id?: string
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          slug: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          fts?: unknown | null
          id?: string
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          slug?: string
          updated_at?: string | null
          url?: string | null
        }
      }
      followers: {
        Row: {
          channel_id: string
          created_at: string | null
          follower_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          follower_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          follower_id?: string
        }
      }
      tracks: {
        Row: {
          created_at: string | null
          description: string | null
          discogs_url: string | null
          fts: unknown | null
          id: string
          mentions: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discogs_url?: string | null
          fts?: unknown | null
          id?: string
          mentions?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discogs_url?: string | null
          fts?: unknown | null
          id?: string
          mentions?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
        }
      }
      user_channel: {
        Row: {
          channel_id: string
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      parse_tokens: {
        Args: {
          content: string
          prefix: string
        }
        Returns: unknown
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
