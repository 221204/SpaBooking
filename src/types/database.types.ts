export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type Database = {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          open_time: string | null;
          close_time: string | null;
          owner_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          address?: string | null;
          open_time?: string | null;
          close_time?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          address?: string | null;
          open_time?: string | null;
          close_time?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          shop_id: string | null;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          shop_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          duration_minutes?: number;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          shop_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          id: string;
          shop_id: string | null;
          name: string;
          phone: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          shop_id?: string | null;
          name: string;
          phone?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          shop_id?: string | null;
          name?: string;
          phone?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_schedules: {
        Row: {
          id: string;
          staff_id: string | null;
          day_of_week: number | null;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          staff_id?: string | null;
          day_of_week?: number | null;
          start_time: string;
          end_time: string;
        };
        Update: {
          id?: string;
          staff_id?: string | null;
          day_of_week?: number | null;
          start_time?: string;
          end_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_schedules_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          shop_id: string | null;
          service_id: string | null;
          staff_id: string | null;
          customer_name: string;
          customer_phone: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: BookingStatus | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          shop_id?: string | null;
          service_id?: string | null;
          staff_id?: string | null;
          customer_name: string;
          customer_phone: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: BookingStatus | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          shop_id?: string | null;
          service_id?: string | null;
          staff_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: BookingStatus | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Row: infer Row;
      }
      ? Row
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer Insert;
      }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer Update;
      }
      ? Update
      : never
    : never;
