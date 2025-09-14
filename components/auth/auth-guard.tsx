'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  fallbackUrl?: string
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  fallbackUrl = '/login' 
}: AuthGuardProps) {
  const { user, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackUrl)
      } else if (requiredRole && !hasRole(requiredRole)) {
        router.push('/dashboard') // 重定向到有权限的页面
      }
    }
  }, [user, loading, requiredRole, hasRole, router, fallbackUrl])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-bg">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-industrial-primary mx-auto" />
          <p className="mt-4 text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user || (requiredRole && !hasRole(requiredRole))) {
    return null
  }

  return <>{children}</>

