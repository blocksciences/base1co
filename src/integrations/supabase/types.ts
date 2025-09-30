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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_wallets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      eligibility_checks: {
        Row: {
          country_code: string | null
          created_at: string | null
          geo_blocked: boolean | null
          id: string
          ip_address: string | null
          kyc_approved: boolean | null
          last_checked_at: string | null
          sanctions_check: boolean | null
          wallet_address: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          geo_blocked?: boolean | null
          id?: string
          ip_address?: string | null
          kyc_approved?: boolean | null
          last_checked_at?: string | null
          sanctions_check?: boolean | null
          wallet_address: string
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          geo_blocked?: boolean | null
          id?: string
          ip_address?: string | null
          kyc_approved?: boolean | null
          last_checked_at?: string | null
          sanctions_check?: boolean | null
          wallet_address?: string
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          country: string
          created_at: string | null
          document_number: string
          document_type: string
          email: string
          full_name: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          selfie_verified: boolean | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          country: string
          created_at?: string | null
          document_number: string
          document_type: string
          email: string
          full_name: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          selfie_verified?: boolean | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          country?: string
          created_at?: string | null
          document_number?: string
          document_type?: string
          email?: string
          full_name?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          selfie_verified?: boolean | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      liquidity_locks: {
        Row: {
          amount: number
          beneficiary_address: string
          contract_address: string
          created_at: string | null
          description: string | null
          id: string
          lock_id: number
          project_id: string | null
          token_address: string
          unlock_time: string
          updated_at: string | null
          withdrawn: boolean | null
        }
        Insert: {
          amount: number
          beneficiary_address: string
          contract_address: string
          created_at?: string | null
          description?: string | null
          id?: string
          lock_id: number
          project_id?: string | null
          token_address: string
          unlock_time: string
          updated_at?: string | null
          withdrawn?: boolean | null
        }
        Update: {
          amount?: number
          beneficiary_address?: string
          contract_address?: string
          created_at?: string | null
          description?: string | null
          id?: string
          lock_id?: number
          project_id?: string | null
          token_address?: string
          unlock_time?: string
          updated_at?: string | null
          withdrawn?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_locks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_activities: {
        Row: {
          action_text: string
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          status: string
          user_address: string | null
        }
        Insert: {
          action_text: string
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status: string
          user_address?: string | null
        }
        Update: {
          action_text?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          user_address?: string | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          active_projects: number | null
          active_users_today: number | null
          created_at: string | null
          id: string
          investments_30d: number | null
          kyc_completed_30d: number | null
          metric_date: string
          new_users_30d: number | null
          pending_kyc: number | null
          platform_revenue_usd: number | null
          total_raised_usd: number | null
          total_transactions_24h: number | null
          total_users: number | null
          total_volume_24h_usd: number | null
          updated_at: string | null
        }
        Insert: {
          active_projects?: number | null
          active_users_today?: number | null
          created_at?: string | null
          id?: string
          investments_30d?: number | null
          kyc_completed_30d?: number | null
          metric_date: string
          new_users_30d?: number | null
          pending_kyc?: number | null
          platform_revenue_usd?: number | null
          total_raised_usd?: number | null
          total_transactions_24h?: number | null
          total_users?: number | null
          total_volume_24h_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          active_projects?: number | null
          active_users_today?: number | null
          created_at?: string | null
          id?: string
          investments_30d?: number | null
          kyc_completed_30d?: number | null
          metric_date?: string
          new_users_30d?: number | null
          pending_kyc?: number | null
          platform_revenue_usd?: number | null
          total_raised_usd?: number | null
          total_transactions_24h?: number | null
          total_users?: number | null
          total_volume_24h_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          banned: boolean | null
          created_at: string | null
          email: string | null
          id: string
          joined_at: string | null
          kyc_status: string
          last_active_at: string | null
          projects_count: number | null
          total_invested_eth: number | null
          total_invested_usd: number | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          banned?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          kyc_status?: string
          last_active_at?: string | null
          projects_count?: number | null
          total_invested_eth?: number | null
          total_invested_usd?: number | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          banned?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          kyc_status?: string
          last_active_at?: string | null
          projects_count?: number | null
          total_invested_eth?: number | null
          total_invested_usd?: number | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          created_at: string
          description: string
          discord: string | null
          email: string
          funding_goal_usd: number
          hard_cap: number | null
          id: string
          initial_price: number | null
          max_contribution: number | null
          min_contribution: number | null
          project_name: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          soft_cap: number | null
          status: string
          telegram: string | null
          token_name: string
          token_symbol: string
          total_supply: number
          twitter: string | null
          updated_at: string
          website: string | null
          whitepaper: string | null
        }
        Insert: {
          created_at?: string
          description: string
          discord?: string | null
          email: string
          funding_goal_usd: number
          hard_cap?: number | null
          id?: string
          initial_price?: number | null
          max_contribution?: number | null
          min_contribution?: number | null
          project_name: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          soft_cap?: number | null
          status?: string
          telegram?: string | null
          token_name: string
          token_symbol: string
          total_supply: number
          twitter?: string | null
          updated_at?: string
          website?: string | null
          whitepaper?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          discord?: string | null
          email?: string
          funding_goal_usd?: number
          hard_cap?: number | null
          id?: string
          initial_price?: number | null
          max_contribution?: number | null
          min_contribution?: number | null
          project_name?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          soft_cap?: number | null
          status?: string
          telegram?: string | null
          token_name?: string
          token_symbol?: string
          total_supply?: number
          twitter?: string | null
          updated_at?: string
          website?: string | null
          whitepaper?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          contract_address: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          goal_amount: number
          id: string
          is_paused: boolean | null
          kyc_registry_address: string | null
          liquidity_locker_address: string | null
          max_per_wallet: number | null
          name: string
          participants_count: number | null
          progress_percentage: number | null
          raised_amount: number | null
          start_date: string
          status: string
          symbol: string
          updated_at: string | null
          vesting_vault_address: string | null
        }
        Insert: {
          contract_address?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          goal_amount: number
          id?: string
          is_paused?: boolean | null
          kyc_registry_address?: string | null
          liquidity_locker_address?: string | null
          max_per_wallet?: number | null
          name: string
          participants_count?: number | null
          progress_percentage?: number | null
          raised_amount?: number | null
          start_date: string
          status?: string
          symbol: string
          updated_at?: string | null
          vesting_vault_address?: string | null
        }
        Update: {
          contract_address?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          goal_amount?: number
          id?: string
          is_paused?: boolean | null
          kyc_registry_address?: string | null
          liquidity_locker_address?: string | null
          max_per_wallet?: number | null
          name?: string
          participants_count?: number | null
          progress_percentage?: number | null
          raised_amount?: number | null
          start_date?: string
          status?: string
          symbol?: string
          updated_at?: string | null
          vesting_vault_address?: string | null
        }
        Relationships: []
      }
      purchase_receipts: {
        Row: {
          amount_eth: number
          amount_tokens: number
          created_at: string | null
          id: string
          project_id: string | null
          receipt_data: Json | null
          token_price: number
          transaction_id: string | null
          wallet_address: string
        }
        Insert: {
          amount_eth: number
          amount_tokens: number
          created_at?: string | null
          id?: string
          project_id?: string | null
          receipt_data?: Json | null
          token_price: number
          transaction_id?: string | null
          wallet_address: string
        }
        Update: {
          amount_eth?: number
          amount_tokens?: number
          created_at?: string | null
          id?: string
          project_id?: string | null
          receipt_data?: Json | null
          token_price?: number
          transaction_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_receipts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_receipts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_crypto: string
          amount_usd: number | null
          created_at: string | null
          from_address: string
          id: string
          project_id: string | null
          project_name: string | null
          status: string
          timestamp: string | null
          transaction_type: string
          tx_hash: string
        }
        Insert: {
          amount_crypto: string
          amount_usd?: number | null
          created_at?: string | null
          from_address: string
          id?: string
          project_id?: string | null
          project_name?: string | null
          status?: string
          timestamp?: string | null
          transaction_type: string
          tx_hash: string
        }
        Update: {
          amount_crypto?: string
          amount_usd?: number | null
          created_at?: string | null
          from_address?: string
          id?: string
          project_id?: string | null
          project_name?: string | null
          status?: string
          timestamp?: string | null
          transaction_type?: string
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount_eth: number
          amount_usd: number | null
          created_at: string
          id: string
          project_id: string | null
          project_name: string
          project_symbol: string
          status: string
          tokens_received: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          amount_eth: number
          amount_usd?: number | null
          created_at?: string
          id?: string
          project_id?: string | null
          project_name: string
          project_symbol: string
          status?: string
          tokens_received: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          amount_eth?: number
          amount_usd?: number | null
          created_at?: string
          id?: string
          project_id?: string | null
          project_name?: string
          project_symbol?: string
          status?: string
          tokens_received?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vesting_schedules: {
        Row: {
          beneficiary_address: string
          cliff_duration: number
          contract_address: string
          created_at: string | null
          id: string
          project_id: string | null
          released_amount: number | null
          revocable: boolean | null
          revoked: boolean | null
          schedule_type: string
          start_time: string
          total_amount: number
          updated_at: string | null
          vesting_duration: number
        }
        Insert: {
          beneficiary_address: string
          cliff_duration: number
          contract_address: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          released_amount?: number | null
          revocable?: boolean | null
          revoked?: boolean | null
          schedule_type: string
          start_time: string
          total_amount: number
          updated_at?: string | null
          vesting_duration: number
        }
        Update: {
          beneficiary_address?: string
          cliff_duration?: number
          contract_address?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          released_amount?: number | null
          revocable?: boolean | null
          revoked?: boolean | null
          schedule_type?: string
          start_time?: string
          total_amount?: number
          updated_at?: string | null
          vesting_duration?: number
        }
        Relationships: [
          {
            foreignKeyName: "vesting_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_wallet_admin: {
        Args: { check_wallet_address: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
