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
import { useAuth } from '@/hooks/use-auth'
import { 
  User, 
  Lock, 
  Bell, 
  Database, 
  Palette,
  Shield,
  Save,
  Loader2
} from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    browserNotifications: false,
    criticalOnly: false,
  })
  
  const { toast } = useToast()
  const { user, supabase } = useSupabase()
  const { userRole } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchNotificationSettings()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchNotificationSettings = async () => {
    // 这里可以从数据库或localStorage获取通知设置
    const saved = localStorage.getItem('notification_settings')
    if (saved) {
      setNotifications(JSON.parse(saved))
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: userProfile.name })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: '更新成功',
        description: '个人信息已更新',
      })
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '新密码和确认密码不一致',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      toast({
        title: '密码更新成功',
        description: '您的密码已更新',
      })

      // 清空表单
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast({
        title: '密码更新失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotifications = () => {
    localStorage.setItem('notification_settings', JSON.stringify(notifications))
    toast({
      title: '设置已保存',
      description: '通知设置已更新',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold industrial-gradient-text">系统设置</h1>
        <p className="text-gray-400 mt-2">管理您的账户和系统偏好设置</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-industrial-card border border-industrial-primary/20">
          <TabsTrigger value="profile" className="data-[state=active]:bg-industrial-primary/20">
            <User className="mr-2 h-4 w-4" />
            个人信息
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-industrial-primary/20">
            <Lock className="mr-2 h-4 w-4" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-industrial-primary/20">
            <Bell className="mr-2 h-4 w-4" />
            通知设置
          </TabsTrigger>
          {userRole === 'admin' && (
            <TabsTrigger value="system" className="data-[state=active]:bg-industrial-primary/20">
              <Database className="mr-2 h-4 w-4" />
              系统设置
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-industrial-primary">个人信息</CardTitle>
              <CardDescription className="text-gray-400">
                更新您的个人资料信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  value={userProfile.email}
                  disabled
                  className="bg-industrial-bg border-industrial-primary/30 opacity-50"
                />
                <p className="text-xs text-gray-500">邮箱地址不可更改</p>
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <div className="px-3 py-2 rounded-lg bg-industrial-bg border border-industrial-primary/30">
                  <span className="text-industrial-primary capitalize">{userRole}</span>
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
                    保存更改
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-industrial-danger">更改密码</CardTitle>
              <CardDescription className="text-gray-400">
                定期更改密码以保护账户安全
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={loading || !passwordForm.newPassword}
                className="bg-industrial-danger text-white hover:bg-industrial-danger/80"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    更新密码
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="text-industrial-warning">通知偏好</CardTitle>
              <CardDescription className="text-gray-400">
                选择您希望接收通知的方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-alerts">邮件通知</Label>
                  <p className="text-sm text-gray-500">通过邮件接收重要预警</p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-notifications">浏览器通知</Label>
                  <p className="text-sm text-gray-500">在浏览器中显示桌面通知</p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={notifications.browserNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, browserNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="critical-only">仅关键预警</Label>
                  <p className="text-sm text-gray-500">只接收严重级别的预警通知</p>
                </div>
                <Switch
                  id="critical-only"
                  checked={notifications.criticalOnly}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, criticalOnly: checked })
                  }
                />
              </div>
              <Button
                onClick={handleUpdateNotifications}
                className="bg-industrial-warning text-black hover:bg-industrial-warning/80"
              >
                <Bell className="mr-2 h-4 w-4" />
                保存通知设置
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="system" className="space-y-4">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="text-industrial-success">系统配置</CardTitle>
                <CardDescription className="text-gray-400">
                  管理系统级别的设置和配置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-industrial-bg border border-industrial-primary/20">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-industrial-primary" />
                    <div>
                      <h4 className="font-medium">数据备份</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        自动备份已启用，每日凌晨 2:00 执行
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-industrial-bg border border-industrial-primary/20">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-industrial-success" />
                    <div>
                      <h4 className="font-medium">数据保留期</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        实验数据保留 365 天
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-industrial-bg border border-industrial-primary/20">
                  <div className="flex items-center space-x-3">
                    <Palette className="h-5 w-5 text-industrial-warning" />
                    <div>
                      <h4 className="font-medium">界面主题</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        工业深色主题（默认）
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}