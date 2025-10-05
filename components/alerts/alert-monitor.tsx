'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, Bell, BellOff, CheckCircle, XCircle, AlertCircle, Info, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Alert {
  id: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  threshold_value?: number
  actual_value?: number
  is_resolved: boolean
  resolved_at?: string
  created_at: string
  experiment_id?: string
}

export function AlertMonitor({ compact = false }: { compact?: boolean }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()

    // 订阅实时预警
    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('Alert change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newAlert = payload.new as Alert
            setAlerts((prev) => [newAlert, ...prev])
            
            // 显示通知
            if (notificationsEnabled) {
              showNotification(newAlert)
            }
            
            // 显示toast
            toast({
              title: '新预警',
              description: newAlert.message,
              variant: 'destructive',
            })
          } else if (payload.eventType === 'UPDATE') {
            setAlerts((prev) =>
              prev.map((alert) =>
                alert.id === payload.new.id ? (payload.new as Alert) : alert
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setAlerts((prev) => prev.filter((alert) => alert.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, notificationsEnabled, toast])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(compact ? 5 : 20)

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
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
          <div className="flex items-center space-x-2">
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
            <AlertTriangle className="h-5 w-5 text-industrial-danger animate-pulse" />
          </div>
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
                    ) : !compact ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsResolved(alert.id)}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
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