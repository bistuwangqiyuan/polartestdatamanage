'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Activity, Database, FileSpreadsheet, Zap } from 'lucide-react'
import { OverviewMetrics } from '@/types'
import { formatNumber } from '@/lib/utils'
import dynamic from 'next/dynamic'

// 动态导入图表组件以避免SSR问题
const Chart = dynamic(() => import('@/components/charts/overview-chart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-gray-400">加载图表中...</div>
})

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchMetrics()
    
    // 设置实时订阅
    const channel = supabase
      .channel('metrics-changes')
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('overview_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: '实验总数',
      value: metrics?.total_experiments || 0,
      icon: Database,
      color: 'text-industrial-primary',
      bgColor: 'bg-industrial-primary/10',
      unit: '个',
    },
    {
      title: '数据点总数',
      value: metrics?.total_data_points || 0,
      icon: FileSpreadsheet,
      color: 'text-industrial-success',
      bgColor: 'bg-industrial-success/10',
      unit: '条',
    },
    {
      title: '平均电压',
      value: formatNumber(metrics?.avg_voltage || 0),
      icon: Zap,
      color: 'text-industrial-warning',
      bgColor: 'bg-industrial-warning/10',
      unit: 'V',
    },
    {
      title: '平均功率',
      value: formatNumber(metrics?.avg_power || 0),
      icon: Activity,
      color: 'text-industrial-danger',
      bgColor: 'bg-industrial-danger/10',
      unit: 'W',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold industrial-gradient-text">数据总览</h1>
        <p className="text-gray-400 mt-2">实时监控实验数据和系统状态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="data-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  <>
                    {stat.value}
                    <span className="text-lg ml-1 text-gray-400">{stat.unit}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 数据趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-industrial-primary">电压/电流趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart type="voltage-current" />
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-industrial-success">功率分布</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart type="power-distribution" />
          </CardContent>
        </Card>
      </div>

      {/* 最新数据表格预览 */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="text-industrial-warning">最新实验数据</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 text-center py-8">
            数据表格组件开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}