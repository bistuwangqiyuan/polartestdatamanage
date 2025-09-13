'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Alert } from '@/types'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AlertMonitorProps {
  compact?: boolean
}

export function AlertMonitor({ compact = false }: AlertMonitorProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAlerts()

    // 设置实时订阅
    const channel = supabase
      .channel('alert-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        () => {
          fetchAlerts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(compact ? 5 : 10)

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10'
      case 'high':
        return 'text-orange-500 bg-orange-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'text-blue-500 bg-blue-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return XCircle
      case 'medium':
        return AlertTriangle
      case 'low':
        return Clock
      default:
        return CheckCircle
    }
  }

  return (
    <Card className="industrial-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-industrial-danger">
            {compact ? '最新预警' : '预警监控中心'}
          </CardTitle>
          <AlertTriangle className="h-5 w-5 text-industrial-danger animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-primary"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-industrial-success mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">暂无预警信息</p>
            <p className="text-sm text-gray-500 mt-2">系统运行正常</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {alerts.map((alert) => {
              const Icon = getSeverityIcon(alert.severity)
              return (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-industrial-bg border border-industrial-primary/20 hover:border-industrial-primary/40 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.threshold_value && alert.actual_value && (
                          <span>
                            阈值: {alert.threshold_value} / 实际: {alert.actual_value}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(alert.created_at)}
                      </p>
                    </div>
                    {alert.is_resolved ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}