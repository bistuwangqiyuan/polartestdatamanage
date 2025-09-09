export * from './database'

export interface ExperimentDataPoint {
  id: string
  sequence_number: number
  timestamp: string
  voltage: number
  current: number
  power: number
  resistance?: number
  temperature?: number
}

export interface Experiment {
  id: string
  experiment_name: string
  description?: string
  operator_name?: string
  device_address?: string
  device_type?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  data?: ExperimentDataPoint[]
}

export interface OverviewMetrics {
  total_experiments: number
  total_data_points: number
  avg_voltage: number
  avg_current: number
  avg_power: number
  max_voltage: number
  max_current: number
  max_power: number
  min_voltage: number
  min_current: number
  min_power: number
}

export interface Alert {
  id: string
  experiment_id?: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  threshold_value?: number
  actual_value?: number
  is_resolved: boolean
  created_at: string
  resolved_at?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'researcher' | 'viewer'
}

export interface ExcelRow {
  序号?: number
  '电流 (A)'?: number
  '电压 (V)'?: number
  '功率 (W)'?: number
  时间戳?: string | number
  设备地址?: string
  设备类型?: string
}