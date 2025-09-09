'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Loader2, LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // 注册新用户
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })

        if (authError) throw authError

        // 创建用户记录
        if (authData.user) {
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email,
              name,
              role: 'researcher',
            })

          if (userError) throw userError
        }

        toast({
          title: '注册成功',
          description: '请查看您的邮箱以验证账户',
        })
      } else {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: '登录成功',
          description: '正在跳转到仪表板...',
        })

        router.push('/dashboard')
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? '注册失败' : '登录失败',
        description: error.message || '请检查您的输入并重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-industrial-bg via-industrial-card to-industrial-bg p-4">
      <Card className="w-full max-w-md industrial-card border-industrial-primary/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center industrial-gradient-text">
            {isSignUp ? '创建账户' : '欢迎回来'}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {isSignUp ? '注册新账户以使用系统' : '登录您的账户以继续'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  disabled={isLoading}
                  className="bg-industrial-bg border-industrial-primary/30 text-white placeholder:text-gray-500 focus:border-industrial-primary"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-industrial-bg border-industrial-primary/30 text-white placeholder:text-gray-500 focus:border-industrial-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-industrial-bg border-industrial-primary/30 text-white placeholder:text-gray-500 focus:border-industrial-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-industrial-primary text-black hover:bg-industrial-primary/80"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="mr-2 h-4 w-4" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isSignUp ? '注册' : '登录'}
            </Button>
            <div className="text-center text-sm text-gray-400">
              {isSignUp ? '已有账户？' : '还没有账户？'}
              <Button
                type="button"
                variant="link"
                className="text-industrial-primary hover:text-industrial-primary/80 p-0 ml-1"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
              >
                {isSignUp ? '立即登录' : '立即注册'}
              </Button>
            </div>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← 返回首页
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}