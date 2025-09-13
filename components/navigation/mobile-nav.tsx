'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  Menu, 
  Home, 
  Upload, 
  Database, 
  FileText, 
  Monitor,
  Users,
  LogOut,
  User
} from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: '数据总览', href: '/dashboard', icon: Home },
  { name: '数据上传', href: '/dashboard/upload', icon: Upload },
  { name: '实验管理', href: '/dashboard/experiments', icon: Database },
  { name: '报告生成', href: '/dashboard/reports', icon: FileText },
  { name: '大屏展示', href: '/display', icon: Monitor, target: '_blank' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user, userRole, canManageUsers } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-industrial-card border-industrial-primary/20">
        <SheetHeader>
          <SheetTitle className="text-industrial-primary">导航菜单</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                target={item.target}
                onClick={() => setOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-industrial-primary/20 text-industrial-primary'
                    : 'text-gray-400 hover:bg-industrial-primary/10 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          {canManageUsers() && (
            <Link
              href="/dashboard/users"
              onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/dashboard/users'
                  ? 'bg-industrial-primary/20 text-industrial-primary'
                  : 'text-gray-400 hover:bg-industrial-primary/10 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>用户管理</span>
            </Link>
          )}
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 px-4 space-y-3">
          <div className="p-3 rounded-lg bg-industrial-bg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-industrial-primary/20">
                <User className="h-4 w-4 text-industrial-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full border-industrial-danger/30 text-industrial-danger hover:bg-industrial-danger/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}