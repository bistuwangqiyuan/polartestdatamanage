import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'researcher' | 'viewer'

export interface UserWithRole extends User {
  role?: UserRole
}

export function useAuth() {
  const { user, supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setUserRole(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserRole(data?.role as UserRole)
      } catch (error) {
        console.error('Error fetching user role:', error)
        setUserRole('viewer') // 默认为访客权限
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user, supabase])

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!userRole) return false

    const roles: UserRole[] = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    // 权限层级：admin > researcher > viewer
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      researcher: 2,
      viewer: 1,
    }

    const userLevel = roleHierarchy[userRole]
    const requiredLevels = roles.map(role => roleHierarchy[role])
    const minRequiredLevel = Math.min(...requiredLevels)

    return userLevel >= minRequiredLevel
  }

  const canEdit = (): boolean => hasRole(['admin', 'researcher'])
  const canDelete = (): boolean => hasRole('admin')
  const canUpload = (): boolean => hasRole(['admin', 'researcher'])
  const canExport = (): boolean => hasRole(['admin', 'researcher'])
  const canManageUsers = (): boolean => hasRole('admin')

  return {
    user,
    userRole,
    loading,
    hasRole,
    canEdit,
    canDelete,
    canUpload,
    canExport,
    canManageUsers,
    isAuthenticated: !!user,
  }
}
