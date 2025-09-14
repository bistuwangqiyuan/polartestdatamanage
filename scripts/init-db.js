
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {

  console.error('❌ 缺少必要的环境变量')
  console.error('请确保在 .env.local 文件中设置了以下变量：')

  console.error('❌ 错误: 缺少必要的环境变量')
  console.error('请确保在 .env.local 文件中设置了以下变量:')

  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {

  console.log('🚀 开始初始化数据库...\n')

  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // 将SQL分割成独立的语句（简单分割，实际可能需要更复杂的解析）
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')

    console.log(`📝 找到 ${statements.length} 条SQL语句\n`)

    // 执行每条语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // 提取语句类型和目标
      const match = statement.match(/^(CREATE|ALTER|INSERT|GRANT)\s+(TABLE|EXTENSION|INDEX|TRIGGER|FUNCTION|POLICY|OR REPLACE FUNCTION)?.*?(?:\s+IF\s+NOT\s+EXISTS)?\s+([^\s(]+)/i)
      const action = match ? match[1] : 'EXECUTE'
      const type = match ? (match[2] || '').toLowerCase() : ''
      const target = match ? match[3] : `Statement ${i + 1}`
      
      process.stdout.write(`  ${i + 1}/${statements.length} ${action} ${type} ${target}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // 如果是"已存在"错误，我们可以忽略
          if (error.message.includes('already exists')) {
            console.log(' ⚠️  已存在（跳过）')
          } else {
            throw error
          }
        } else {
          console.log(' ✅')
        }
      } catch (err) {
        console.log(' ❌')
        console.error(`\n错误: ${err.message}`)
        console.error(`语句: ${statement.substring(0, 100)}...`)
        
        // 对于某些错误我们可以继续
        if (err.message.includes('already exists') || 
            err.message.includes('exec_sql') || 
            err.message.includes('function') ||
            err.message.includes('permission denied')) {
          console.log('  ℹ️  继续执行...')
          continue
        }
        
        throw err
      }
    }

    console.log('\n✅ 数据库初始化完成！')
    
    // 验证表是否创建成功
    console.log('\n📊 验证数据库结构...')
    
    const tables = ['users', 'experiments', 'experiment_data', 'overview_metrics', 'alerts']
    for (const table of tables) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        console.log(`  ❌ 表 ${table} 验证失败: ${error.message}`)
      } else {
        console.log(`  ✅ 表 ${table} 已创建`)
      }
    }

    console.log('\n🎉 数据库初始化成功完成！')
    console.log('\n下一步：')
    console.log('1. 运行 npm run dev 启动开发服务器')
    console.log('2. 访问 http://localhost:3000 查看系统')
    console.log('3. 使用注册功能创建第一个用户账户')

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message)
    console.error('\n💡 提示：')
    console.error('1. 如果提示 exec_sql 函数不存在，请直接在 Supabase SQL Editor 中执行迁移文件')
    console.error('2. 确保您的 Supabase 项目正在运行')
    console.error('3. 检查环境变量是否正确设置')

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


// 运行初始化
initDatabase().catch(console.error)

// 执行初始化
initDatabase()

