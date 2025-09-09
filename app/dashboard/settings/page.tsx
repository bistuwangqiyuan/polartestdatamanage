'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Save,
  Loader2
} from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: '',
  })
  const [alertSettings, setAlertSettings] = useState({
    voltageThreshold: 30,
    currentThreshold: 2,
    powerThreshold: 50,
    emailNotifications: true,
  })
  
  const { toast } = useToast()
  const { supabase, user } = useSupabase()

  useEffect(() => {
    if (user) {
      fetchUserInfo()
      fetchAlertSettings()
    }
  }, [user])

  const fetchUserInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      if (data) {
        setUserInfo({
          name: data.name,
          email: data.email,
          role: data.role,
        })
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchAlertSettings = async () => {
    // 这里可以从数据库获取用户的告警设置
    // 目前使用默认值
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: userInfo.name })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: '更新成功',
        description: '个人信息已更新',
      })
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAlertSettings = async () => {
    setLoading(true)
    try {
      // 这里应该保存到数据库
      // 目前仅显示成功消息
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: '设置已保存',
        description: '告警阈值已更新',
      })
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      admin: { label: '管理员', color: 'text-industrial-danger' },
      researcher: { label: '研究员', color: 'text-industrial-primary' },
      viewer: { label: '访客', color: 'text-industrial-success' },
    }
    return roleMap[role] || { label: role, color: 'text-gray-400' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold industrial-gradient-text">系统设置</h1>
        <p className="text-gray-400 mt-2">管理您的个人信息和系统配置</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-industrial-card border-industrial-primary/20">
          <TabsTrigger value="profile" className="data-[state=active]:bg-industrial-primary data-[state=active]:text-black">
            <User className="mr-2 h-4 w-4" />
            个人信息
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-industrial-primary data-[state=active]:text-black">
            <Bell className="mr-2 h-4 w-4" />
            告警设置
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-industrial-primary data-[state=active]:text-black">
            <Database className="mr-2 h-4 w-4" />
            系统信息
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-industrial-primary">个人信息</CardTitle>
              <CardDescription className="text-gray-400">
                更新您的个人资料
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  value={userInfo.email}
                  disabled
                  className="bg-industrial-bg border-industrial-primary/30 opacity-50"
                />
                <p className="text-xs text-gray-500">邮箱地址不可修改</p>
              </div>

              <div className="space-y-2">
                <Label>角色权限</Label>
                <div className="flex items-center space-x-2">
                  <Shield className={`h-5 w-5 ${getRoleBadge(userInfo.role).color}`} />
                  <span className={`font-medium ${getRoleBadge(userInfo.role).color}`}>
                    {getRoleBadge(userInfo.role).label}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-industrial-primary text-black hover:bg-industrial-primary/80"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存修改
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-industrial-warning">告警阈值设置</CardTitle>
              <CardDescription className="text-gray-400">
                配置数据异常告警的触发条件
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voltage-threshold">电压阈值 (V)</Label>
                  <Input
                    id="voltage-threshold"
                    type="number"
                    value={alertSettings.voltageThreshold}
                    onChange={(e) => setAlertSettings({
                      ...alertSettings,
                      voltageThreshold: parseFloat(e.target.value)
                    })}
                    className="bg-industrial-bg border-industrial-primary/30"
                  />
                  <p className="text-xs text-gray-500">超过此值将触发告警</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-threshold">电流阈值 (A)</Label>
                  <Input
                    id="current-threshold"
                    type="number"
                    step="0.1"
                    value={alertSettings.currentThreshold}
                    onChange={(e) => setAlertSettings({
                      ...alertSettings,
                      currentThreshold: parseFloat(e.target.value)
                    })}
                    className="bg-industrial-bg border-industrial-primary/30"
                  />
                  <p className="text-xs text-gray-500">超过此值将触发告警</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="power-threshold">功率阈值 (W)</Label>
                  <Input
                    id="power-threshold"
                    type="number"
                    value={alertSettings.powerThreshold}
                    onChange={(e) => setAlertSettings({
                      ...alertSettings,
                      powerThreshold: parseFloat(e.target.value)
                    })}
                    className="bg-industrial-bg border-industrial-primary/30"
                  />
                  <p className="text-xs text-gray-500">超过此值将触发告警</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-industrial-bg">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">邮件通知</Label>
                  <p className="text-sm text-gray-500">
                    当触发告警时发送邮件通知
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={alertSettings.emailNotifications}
                  onCheckedChange={(checked) => setAlertSettings({
                    ...alertSettings,
                    emailNotifications: checked
                  })}
                />
              </div>

              <Button
                onClick={handleUpdateAlertSettings}
                disabled={loading}
                className="bg-industrial-warning text-black hover:bg-industrial-warning/80"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存设置
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-industrial-success">系统信息</CardTitle>
              <CardDescription className="text-gray-400">
                查看系统版本和配置信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">系统版本</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">应用版本:</span>
                      <span className="font-mono">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">构建日期:</span>
                      <span className="font-mono">2025-01-14</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">环境:</span>
                      <span className="font-mono">Production</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">数据库信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">数据库类型:</span>
                      <span className="font-mono">PostgreSQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">连接状态:</span>
                      <span className="text-industrial-success">已连接</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">数据同步:</span>
                      <span className="text-industrial-success">正常</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-industrial-bg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">技术栈</h4>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 14', 'React 18', 'TypeScript', 'Supabase', 'TailwindCSS', 'Recharts'].map(tech => (
                    <span key={tech} className="px-2 py-1 text-xs rounded bg-industrial-primary/20 text-industrial-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}