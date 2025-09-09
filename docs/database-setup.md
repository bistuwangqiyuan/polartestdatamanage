# 数据库设置指南

## Supabase 数据库初始化

### 1. 登录 Supabase 控制台

访问 [Supabase Dashboard](https://app.supabase.com) 并使用提供的项目凭据登录。

### 2. 执行数据库迁移

1. 在 Supabase 控制台中，导航到 **SQL Editor**
2. 打开文件 `/workspace/supabase/migrations/001_create_tables.sql`
3. 复制全部内容并粘贴到 SQL Editor 中
4. 点击 **Run** 执行脚本

### 3. 验证表结构

执行以下查询验证表是否创建成功：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

应该看到以下表：
- users
- experiments
- experiment_data
- overview_metrics
- alerts

### 4. 插入测试数据（可选）

```sql
-- 插入测试用户
INSERT INTO users (email, name, role) VALUES
('admin@example.com', '管理员', 'admin'),
('researcher1@example.com', '研究员1', 'researcher'),
('viewer@example.com', '访客', 'viewer');

-- 插入测试实验
INSERT INTO experiments (experiment_name, description, operator_name, device_address, device_type) VALUES
('光伏关断器测试-001', '首次电压电流测试', '研究员1', '1', '光伏关断器-A型');

-- 插入测试数据（会自动计算功率和阻值）
INSERT INTO experiment_data (experiment_id, sequence_number, timestamp, voltage, current) 
SELECT 
  (SELECT id FROM experiments LIMIT 1),
  1,
  NOW(),
  20.355,
  0.11;
```

### 5. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.CTLF9Ahmxt7alyiv-sf_Gl3U6SNIWZ01PapTI92Hg0g
```

### 6. 数据库架构说明

#### 表关系
- `users` ← `experiments` (一对多)
- `experiments` ← `experiment_data` (一对多)
- `experiments` ← `alerts` (一对多)

#### 自动触发器
1. **calculate_power_resistance**: 自动计算功率和阻值
2. **update_overview_metrics**: 自动更新统计指标
3. **check_anomalies**: 自动检测异常并生成预警
4. **update_updated_at_column**: 自动更新时间戳

#### 行级安全策略 (RLS)
- 所有用户可查看数据
- 认证用户可创建数据
- 数据所有者和管理员可编辑
- 仅管理员可删除数据

### 7. 性能优化建议

1. **定期维护**
   ```sql
   -- 更新统计信息
   ANALYZE;
   
   -- 清理死元组
   VACUUM ANALYZE;
   ```

2. **监控查询性能**
   ```sql
   -- 查看慢查询
   SELECT query, calls, mean_exec_time, max_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **数据归档**
   - 定期将历史数据移至归档表
   - 保持主表数据量在合理范围内

### 8. 备份策略

Supabase 自动提供：
- 每日自动备份
- 7天备份保留期
- Point-in-time 恢复能力

手动备份：
```bash
# 使用 pg_dump 导出数据
pg_dump -h db.zzyueuweeoakopuuwfau.supabase.co -U postgres -d postgres > backup.sql
```

### 9. 常见问题

**Q: 如何重置数据库？**
A: 删除所有表并重新运行迁移脚本

**Q: 如何修改阈值？**
A: 更新 `check_anomalies()` 函数中的阈值变量

**Q: 如何添加新的指标？**
A: 修改相关表结构并更新触发器函数

### 10. 联系支持

如遇到数据库相关问题，请联系：
- 技术支持邮箱：support@pv-system.com
- Supabase 官方文档：https://supabase.com/docs