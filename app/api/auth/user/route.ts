import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }
    
    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
    }
    
    return NextResponse.json({
      ...userData,
      email: user.email,
    })
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }
    
    // 更新用户信息
    const { data, error } = await supabase
      .from('users')
      .update({
        name: body.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}