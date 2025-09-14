import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 检查当前用户是否为管理员
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }
    
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    
    // 获取所有用户列表
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
    }
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const serviceRoleSupabase = await createServiceRoleClient()
    const body = await request.json()
    
    // 检查当前用户是否为管理员
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }
    
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    
    // 更新用户角色
    const { data, error } = await serviceRoleSupabase
      .from('users')
      .update({
        role: body.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.userId)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: '更新用户角色失败' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}