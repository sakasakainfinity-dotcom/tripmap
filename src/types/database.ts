export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      spaces: {
        Row: {
          id: string;
          name: string;
          type: "solo" | "pair";
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "solo" | "pair";
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "solo" | "pair";
          owner_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "spaces_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      space_members: {
        Row: {
          space_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at: string;
        };
        Insert: {
          space_id: string;
          user_id: string;
          role?: "owner" | "member";
          created_at?: string;
        };
        Update: {
          space_id?: string;
          user_id?: string;
          role?: "owner" | "member";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      places: {
        Row: {
          id: string;
          space_id: string;
          lat: number;
          lng: number;
          title: string;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          lat: number;
          lng: number;
          title: string;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          lat?: number;
          lng?: number;
          title?: string;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "places_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          }
        ];
      };
      memories: {
        Row: {
          id: string;
          space_id: string;
          place_id: string;
          visited_at: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          place_id: string;
          visited_at?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          place_id?: string;
          visited_at?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memories_place_id_fkey";
            columns: ["place_id"];
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memories_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          }
        ];
      };
      photos: {
        Row: {
          id: string;
          space_id: string;
          memory_id: string;
          file_url: string;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          memory_id: string;
          file_url: string;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          memory_id?: string;
          file_url?: string;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_memory_id_fkey";
            columns: ["memory_id"];
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          created_at: string;
          updated_at: string;
          public: boolean;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          owner?: string | null;
          created_at?: string;
          updated_at?: string;
          public?: boolean;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string;
          updated_at?: string;
          public?: boolean;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string | null;
          created_at: string;
          updated_at: string;
          last_accessed_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          bucket_id: string;
          name: string;
          owner?: string | null;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          bucket_id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucket_id_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
