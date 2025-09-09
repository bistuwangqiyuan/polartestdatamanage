export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'researcher' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'researcher' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'researcher' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      experiments: {
        Row: {
          id: string
          experiment_name: string
          description: string | null
          operator_id: string | null
          operator_name: string | null
          device_address: string | null
          device_type: string | null
          status: 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          experiment_name: string
          description?: string | null
          operator_id?: string | null
          operator_name?: string | null
          device_address?: string | null
          device_type?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          experiment_name?: string
          description?: string | null
          operator_id?: string | null
          operator_name?: string | null
          device_address?: string | null
          device_type?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      experiment_data: {
        Row: {
          id: string
          experiment_id: string
          sequence_number: number | null
          timestamp: string
          voltage: number | null
          current: number | null
          power: number | null
          resistance: number | null
          temperature: number | null
          created_at: string
        }
        Insert: {
          id?: string
          experiment_id: string
          sequence_number?: number | null
          timestamp: string
          voltage?: number | null
          current?: number | null
          power?: number | null
          resistance?: number | null
          temperature?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          experiment_id?: string
          sequence_number?: number | null
          timestamp?: string
          voltage?: number | null
          current?: number | null
          power?: number | null
          resistance?: number | null
          temperature?: number | null
          created_at?: string
        }
      }
      overview_metrics: {
        Row: {
          id: string
          metric_date: string
          total_experiments: number
          total_data_points: number
          avg_voltage: number | null
          avg_current: number | null
          avg_power: number | null
          max_voltage: number | null
          max_current: number | null
          max_power: number | null
          min_voltage: number | null
          min_current: number | null
          min_power: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          metric_date?: string
          total_experiments?: number
          total_data_points?: number
          avg_voltage?: number | null
          avg_current?: number | null
          avg_power?: number | null
          max_voltage?: number | null
          max_current?: number | null
          max_power?: number | null
          min_voltage?: number | null
          min_current?: number | null
          min_power?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          metric_date?: string
          total_experiments?: number
          total_data_points?: number
          avg_voltage?: number | null
          avg_current?: number | null
          avg_power?: number | null
          max_voltage?: number | null
          max_current?: number | null
          max_power?: number | null
          min_voltage?: number | null
          min_current?: number | null
          min_power?: number | null
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          experiment_id: string | null
          alert_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          message: string
          threshold_value: number | null
          actual_value: number | null
          is_resolved: boolean
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          experiment_id?: string | null
          alert_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          message: string
          threshold_value?: number | null
          actual_value?: number | null
          is_resolved?: boolean
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          experiment_id?: string | null
          alert_type?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          message?: string
          threshold_value?: number | null
          actual_value?: number | null
          is_resolved?: boolean
          created_at?: string
          resolved_at?: string | null
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