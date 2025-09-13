#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 缺少必要的环境变量')
  console.error('请确保在 .env.local 文件中设置了以下变量:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {
  console.log('🚀 开始初始化数据库...')

  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 读取迁移文件成功')

    // 执行迁移
    // 注意：由于Supabase的限制，我们不能直接执行包含多个语句的SQL
    // 建议在Supabase控制台中手动执行迁移文件
    
    console.log('\n⚠️  注意: ')
    console.log('由于Supabase客户端限制，请在Supabase控制台中手动执行以下SQL迁移:')
    console.log(`文件路径: ${migrationPath}`)
    console.log('\n步骤:')
    console.log('1. 登录 Supabase 控制台: https://app.supabase.com')
    console.log('2. 选择您的项目')
    console.log('3. 进入 SQL Editor')
    console.log('4. 复制并粘贴迁移文件的内容')
    console.log('5. 点击 Run 执行')

    // 验证表是否存在
    console.log('\n🔍 验证数据库表...')
    
    const tables = ['users', 'experiments', 'experiment_data', 'overview_metrics', 'alerts']
    const missingTables = []

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      
      if (error && error.code === '42P01') {
        missingTables.push(table)
      } else if (!error) {
        console.log(`✅ 表 '${table}' 存在`)
      }
    }

    if (missingTables.length > 0) {
      console.log('\n❌ 缺少以下表:')
      missingTables.forEach(table => console.log(`  - ${table}`))
      console.log('\n请先在Supabase控制台中执行迁移文件')
    } else {
      console.log('\n✅ 所有表都已创建')
      
      // 插入示例数据（可选）
      console.log('\n📊 插入示例数据...')
      
      // 检查是否已有数据
      const { count } = await supabase
        .from('experiments')
        .select('*', { count: 'exact', head: true })
      
      if (count === 0) {
        // 插入示例实验
        const { data: experiment, error: expError } = await supabase
          .from('experiments')
          .insert({
            experiment_name: '示例实验 - 光伏关断器测试',
            description: '这是一个示例实验，用于演示系统功能',
            operator_name: '系统管理员',
            device_address: '1',
            device_type: '光伏关断器-A型',
            status: 'active'
          })
          .select()
          .single()

        if (!expError && experiment) {
          console.log('✅ 创建示例实验成功')

          // 插入示例数据点
          const sampleData = []
          for (let i = 1; i <= 10; i++) {
            sampleData.push({
              experiment_id: experiment.id,
              sequence_number: i,
              timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString(),
              voltage: 20 + Math.random() * 2,
              current: 0.1 + Math.random() * 0.5
            })
          }

          const { error: dataError } = await supabase
            .from('experiment_data')
            .insert(sampleData)

          if (!dataError) {
            console.log('✅ 插入示例数据成功')
          }
        }
      } else {
        console.log('ℹ️  数据库中已有数据，跳过示例数据插入')
      }
    }

    console.log('\n🎉 数据库初始化完成！')
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message)
    process.exit(1)
  }
}

// 执行初始化
initDatabase()