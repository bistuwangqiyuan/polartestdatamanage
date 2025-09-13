'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Alert } from '@/types'
import { formatDate } from '@/lib/utils'
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AlertMonitorProps {
  experimentId?: string
  compact?: boolean
}

export function AlertMonitor({ experimentId, compact = false }: AlertMonitorProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
    
    // 设置实时订阅
    const channel = supabase
      .channel(`alerts-${experimentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: experimentId ? `experiment_id=eq.${experimentId}` : undefined,
        },
        (payload) => {
          const newAlert = payload.new as Alert
          setAlerts(prev => [newAlert, ...prev])
          
          // 显示通知
          if (notificationsEnabled) {
            showNotification(newAlert)
          }
          
          // 显示 toast
          toast({
            title: '新的预警',
            description: newAlert.message,
            variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [experimentId, notificationsEnabled])

  const fetchAlerts = async () => {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (experimentId) {
        query = query.eq('experiment_id', experimentId)
      }

      if (compact) {
        query = query.limit(5)
      }

      const { data, error } = await query

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (alert: Alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('实验数据预警', {
        body: alert.message,
        icon: '/favicon.svg',
        tag: alert.id,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  const toggleNotifications = async () => {
    if (!notificationsEnabled && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        toast({
          title: '通知已启用',
          description: '您将收到新预警的桌面通知',
        })
      } else {
        toast({
          title: '通知权限被拒绝',
          description: '请在浏览器设置中启用通知权限',
          variant: 'destructive',
        })
      }
    } else {
      setNotificationsEnabled(false)
      toast({
        title: '通知已关闭',
        description: '您将不再收到桌面通知',
      })
    }
  }

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      // 更新本地状态
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_resolved: true, resolved_at: new Date().toISOString() }
            : alert
        )
      )

      toast({
        title: '预警已处理',
        description: '预警状态已更新为已解决',
      })
    } catch (error) {
      toast({
        title: '操作失败',
        description: '无法更新预警状态',
        variant: 'destructive',
      })
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/10'
      case 'high':
        return 'border-orange-500 bg-orange-500/10'
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'border-blue-500 bg-blue-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '严重'
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return severity
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-primary"></div>
      </div>
    )
  }

  return (
    <Card className={compact ? 'h-full' : 'industrial-card'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-industrial-danger">
              预警监控
            </CardTitle>
            <CardDescription className="text-gray-400">
              实时监控异常数据和系统预警
            </CardDescription>
          </div>
          {!compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNotifications}
              className="border-industrial-primary/30"
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  通知已开启
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  开启通知
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-industrial-success mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">暂无预警信息</p>
              <p className="text-sm text-gray-500 mt-2">系统运行正常</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{alert.message}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {getSeverityText(alert.severity)}
                        </span>
                      </div>
                      {alert.threshold_value && alert.actual_value && (
                        <p className="text-sm text-gray-500 mt-1">
                          阈值: {alert.threshold_value} / 实际: {alert.actual_value}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {formatDate(alert.created_at)}
                      </p>
                    </div>
                  </div>
                  {!alert.is_resolved && !compact && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsResolved(alert.id)}
                      className="ml-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {alert.is_resolved && (
                    <span className="text-xs text-green-500 ml-2">已解决</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}