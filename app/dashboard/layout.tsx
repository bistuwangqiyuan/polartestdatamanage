'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/components/providers/supabase-provider'
import { 
  BarChart3, 
  Database, 
  FileSpreadsheet, 
  LogOut, 
  Menu, 
  Monitor,
  Settings,
  User,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '数据总览', href: '/dashboard', icon: BarChart3 },
  { name: '实验管理', href: '/dashboard/experiments', icon: Database },
  { name: '数据上传', href: '/dashboard/upload', icon: FileSpreadsheet },
  { name: '大屏展示', href: '/display', icon: Monitor, target: '_blank' },
  { name: '系统设置', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user, supabase } = useSupabase()

  useEffect(() => {
    if (user) {
      // 获取用户信息
      supabase
        .from('users')
        .select('name, email, role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserInfo(data)
          }
        })
    }
  }, [user, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-industrial-bg">
      {/* 移动端侧边栏背景遮罩 */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-industrial-card border-r border-industrial-primary/20 transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-industrial-primary/20">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-industrial-primary" />
              <span className="text-xl font-bold industrial-gradient-text">PV System</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  target={item.target}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-industrial-primary/20 text-industrial-primary'
                      : 'text-gray-400 hover:bg-industrial-primary/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* 用户信息 */}
          {userInfo && (
            <div className="border-t border-industrial-primary/20 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-industrial-primary/20">
                  <User className="h-5 w-5 text-industrial-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{userInfo.name}</p>
                  <p className="text-xs text-gray-400">{userInfo.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="lg:pl-64">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-industrial-primary/20 bg-industrial-card/80 backdrop-blur-md px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="text-sm text-gray-400">
            {new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}