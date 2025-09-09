'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { OverviewMetrics, Alert, ExperimentDataPoint } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Database,
  FileSpreadsheet,
  Clock,
  CheckCircle
} from 'lucide-react'
import dynamic from 'next/dynamic'

// 动态导入图表组件
const RealtimeChart = dynamic(() => import('@/components/charts/realtime-chart'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-gray-400">加载图表中...</div>
})

const PowerDistribution = dynamic(() => import('@/components/charts/power-distribution'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-gray-400">加载图表中...</div>
})

export default function DisplayPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [latestData, setLatestData] = useState<ExperimentDataPoint[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeExperiments, setActiveExperiments] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // 初始加载数据
    fetchMetrics()
    fetchAlerts()
    fetchLatestData()
    fetchActiveExperiments()

    // 设置定时器更新时间
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 设置定时器刷新数据
    const dataInterval = setInterval(() => {
      fetchMetrics()
      fetchLatestData()
      fetchActiveExperiments()
    }, 5000) // 每5秒刷新一次

    // 设置实时订阅
    const metricsChannel = supabase
      .channel('display-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overview_metrics',
        },
        () => {
          fetchMetrics()
        }
      )
      .subscribe()

    const alertsChannel = supabase
      .channel('display-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        () => {
          fetchAlerts()
        }
      )
      .subscribe()

    const dataChannel = supabase
      .channel('display-data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'experiment_data',
        },
        () => {
          fetchLatestData()
        }
      )
      .subscribe()

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
      supabase.removeChannel(metricsChannel)
      supabase.removeChannel(alertsChannel)
      supabase.removeChannel(dataChannel)
    }
  }, [])

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('overview_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setRecentAlerts(data)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const fetchLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from('experiment_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setLatestData(data.reverse())
      }
    } catch (error) {
      console.error('Error fetching latest data:', error)
    }
  }

  const fetchActiveExperiments = async () => {
    try {
      const { count, error } = await supabase
        .from('experiments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (!error) {
        setActiveExperiments(count || 0)
      }
    } catch (error) {
      console.error('Error fetching active experiments:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-industrial-bg p-6">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold industrial-gradient-text">
            光伏关断器实验数据监控中心
          </h1>
          <p className="text-gray-400 mt-2">实时数据监控与分析</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-industrial-primary">
            {currentTime.toLocaleTimeString('zh-CN')}
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧 - 关键指标 */}
        <div className="col-span-3 space-y-4">
          {/* 实验统计 */}
          <Card className="data-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">实验统计</h3>
              <Database className="h-4 w-4 text-industrial-primary" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">总实验数</span>
                <span className="text-xl font-bold text-white">
                  {metrics?.total_experiments || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">进行中</span>
                <span className="text-xl font-bold text-industrial-success">
                  {activeExperiments}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">数据点</span>
                <span className="text-xl font-bold text-industrial-warning">
                  {metrics?.total_data_points || 0}
                </span>
              </div>
            </div>
          </Card>

          {/* 电压指标 */}
          <Card className="data-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">电压监控</h3>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">当前平均</span>
                  <span className="text-2xl font-bold text-industrial-primary">
                    {formatNumber(metrics?.avg_voltage || 0)}
                    <span className="text-sm ml-1">V</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">最小值</p>
                  <p className="font-semibold text-industrial-danger">
                    {formatNumber(metrics?.min_voltage || 0)} V
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">最大值</p>
                  <p className="font-semibold text-industrial-success">
                    {formatNumber(metrics?.max_voltage || 0)} V
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 电流指标 */}
          <Card className="data-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">电流监控</h3>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">当前平均</span>
                  <span className="text-2xl font-bold text-industrial-success">
                    {formatNumber(metrics?.avg_current || 0, 3)}
                    <span className="text-sm ml-1">A</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">最小值</p>
                  <p className="font-semibold text-industrial-danger">
                    {formatNumber(metrics?.min_current || 0, 3)} A
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">最大值</p>
                  <p className="font-semibold text-industrial-success">
                    {formatNumber(metrics?.max_current || 0, 3)} A
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 功率指标 */}
          <Card className="data-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">功率监控</h3>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">当前平均</span>
                  <span className="text-2xl font-bold text-industrial-warning">
                    {formatNumber(metrics?.avg_power || 0)}
                    <span className="text-sm ml-1">W</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">最小值</p>
                  <p className="font-semibold text-industrial-danger">
                    {formatNumber(metrics?.min_power || 0)} W
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">最大值</p>
                  <p className="font-semibold text-industrial-success">
                    {formatNumber(metrics?.max_power || 0)} W
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 中间 - 实时曲线 */}
        <div className="col-span-6 space-y-4">
          <Card className="industrial-card h-[400px]">
            <div className="p-4 border-b border-industrial-primary/20">
              <h3 className="text-lg font-semibold text-industrial-primary">
                实时数据趋势
              </h3>
              <p className="text-sm text-gray-400">最近50个数据点</p>
            </div>
            <div className="p-4 h-[calc(100%-80px)]">
              <RealtimeChart data={latestData} />
            </div>
          </Card>

          <Card className="industrial-card h-[300px]">
            <div className="p-4 border-b border-industrial-primary/20">
              <h3 className="text-lg font-semibold text-industrial-success">
                功率分布分析
              </h3>
              <p className="text-sm text-gray-400">功率区间统计</p>
            </div>
            <div className="p-4 h-[calc(100%-80px)]">
              <PowerDistribution data={latestData} />
            </div>
          </Card>
        </div>

        {/* 右侧 - 预警信息 */}
        <div className="col-span-3 space-y-4">
          <Card className="industrial-card h-[720px]">
            <div className="p-4 border-b border-industrial-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-industrial-danger">
                  异常预警
                </h3>
                <AlertTriangle className="h-5 w-5 text-industrial-danger animate-pulse" />
              </div>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-industrial-bg border border-industrial-primary/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.threshold_value && alert.actual_value && (
                            <span>
                              阈值: {formatNumber(alert.threshold_value)} / 
                              实际: {formatNumber(alert.actual_value)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(alert.created_at)}
                        </p>
                      </div>
                      {alert.is_resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-industrial-success mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">暂无异常预警</p>
                  <p className="text-sm text-gray-500 mt-2">系统运行正常</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-6">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-industrial-success rounded-full mr-2 animate-pulse"></span>
            系统运行正常
          </span>
          <span>数据更新频率: 5秒</span>
          <span>最后更新: {currentTime.toLocaleTimeString('zh-CN')}</span>
        </div>
        <div>
          <span>© 2025 光伏关断器实验数据管理系统</span>
        </div>
      </div>
    </div>
  )
}