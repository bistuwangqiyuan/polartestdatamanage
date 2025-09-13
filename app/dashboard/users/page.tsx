'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserCheck, UserX, Shield, User, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserData {
  id: string
  email: string
  name: string
  role: 'admin' | 'researcher' | 'viewer'
  created_at: string
  updated_at: string
}

const roleIcons = {
  admin: Shield,
  researcher: User,
  viewer: Eye,
}

const roleNames = {
  admin: '管理员',
  researcher: '研究员',
  viewer: '访客',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      toast({
        title: '获取用户列表失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: '更新成功',
        description: '用户角色已更新',
      })

      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as UserData['role'] } : user
      ))
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold industrial-gradient-text">用户管理</h1>
          <p className="text-gray-400 mt-2">管理系统用户及其权限</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-industrial-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => {
              const RoleIcon = roleIcons[user.role]
              return (
                <Card key={user.id} className="industrial-card border-industrial-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-industrial-primary/10">
                          <RoleIcon className="h-6 w-6 text-industrial-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{user.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {user.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-32 bg-industrial-bg border-industrial-primary/30">
                          {updating === user.id && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              管理员
                            </div>
                          </SelectItem>
                          <SelectItem value="researcher">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              研究员
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              访客
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-1" />
                          注册时间：{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-industrial-primary/20 text-industrial-primary">
                        {roleNames[user.role]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}