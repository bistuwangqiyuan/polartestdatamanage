# 光伏关断器电压电流实验检测数据管理与大屏展示系统 PRD

## 1. 项目背景与目标

### 1.1 项目背景
随着光伏产业的快速发展，光伏关断器作为关键安全部件，其性能测试和质量控制至关重要。目前实验室面临以下挑战：
- 实验数据以Excel形式分散存储，管理困难
- 缺乏实时数据可视化能力，难以快速发现问题
- 无法进行多维度数据对比分析
- 实验报告生成效率低下

### 1.2 项目目标
构建一个现代化的电压/电流/功率测试数据管理与可视化系统，实现：
- **数据集中管理**：统一存储和管理所有实验数据
- **实时可视化**：动态展示电压、电流、功率等关键指标趋势
- **智能分析**：支持多维度数据对比和异常检测
- **高效报告**：自动生成标准化实验报告
- **工业级展示**：提供专业的大屏数据总览系统

### 1.3 核心价值
- 提升实验数据管理效率80%
- 减少数据分析时间60%
- 提高实验报告生成速度90%
- 实现实时监控和预警能力

## 2. 系统功能模块设计

### 2.1 功能架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        系统总览大屏                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 实时数据卡片 │  │ 趋势曲线图  │  │ 统计分析图  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        核心功能模块                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │用户认证  │  │数据上传  │  │数据管理  │  │报告导出  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层（Supabase）                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │用户表    │  │实验表    │  │数据表    │  │指标表    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 功能模块详细说明

#### 2.2.1 用户认证与权限管理
- **功能描述**：基于Supabase Auth实现用户注册、登录、权限控制
- **用户角色**：
  - 管理员：全部权限（数据管理、用户管理、系统配置）
  - 研究人员：数据上传、查看、导出权限
  - 访客：仅查看大屏展示
- **权限矩阵**：
  | 功能 | 管理员 | 研究人员 | 访客 |
  |------|--------|----------|------|
  | 数据上传 | ✓ | ✓ | × |
  | 数据编辑 | ✓ | × | × |
  | 数据删除 | ✓ | × | × |
  | 报告导出 | ✓ | ✓ | × |
  | 用户管理 | ✓ | × | × |
  | 大屏查看 | ✓ | ✓ | ✓ |

#### 2.2.2 Excel数据上传解析模块
- **支持格式**：.xlsx, .xls, .csv
- **解析功能**：
  - 自动识别数据列（电流、电压、功率、时间戳等）
  - 数据验证和清洗
  - 批量导入（支持多文件同时上传）
  - 导入进度实时显示
- **错误处理**：
  - 格式错误提示
  - 数据异常标记
  - 导入失败回滚

#### 2.2.3 实验数据管理模块
- **数据列表**：
  - 分页展示
  - 多条件筛选（时间范围、设备类型、数值范围）
  - 排序功能
- **数据检索**：
  - 全文搜索
  - 高级查询（组合条件）
  - 快速定位
- **数据操作**：
  - 查看详情
  - 编辑修正
  - 批量删除
  - 数据标注

#### 2.2.4 数据可视化模块
- **图表类型**：
  - 折线图：展示电压/电流/功率随时间变化趋势
  - 散点图：展示数据分布特征
  - 对比图：多组实验数据对比
  - 热力图：数据密度分布
- **交互功能**：
  - 缩放平移
  - 数据点详情
  - 图例切换
  - 数据导出

#### 2.2.5 大屏数据总览
- **布局设计**：四象限布局
  - 左上：关键指标卡片（实时更新）
  - 右上：实时趋势曲线
  - 左下：实验统计分布
  - 右下：异常预警信息
- **视觉效果**：
  - 深色主题
  - 数据动效
  - 自动轮播
  - 响应式适配

#### 2.2.6 实验报告导出模块
- **报告格式**：
  - PDF：标准化报告模板
  - Excel：原始数据+统计分析
- **报告内容**：
  - 实验基本信息
  - 数据统计分析
  - 趋势图表
  - 异常记录
  - 结论建议

## 3. 数据流转与架构设计

### 3.1 系统架构图
```
┌─────────────────────────────────────────────────────────────┐
│                         前端层                               │
│  Next.js + TailwindCSS + shadcn/ui + Recharts              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │页面组件  │  │状态管理  │  │API调用   │  │图表组件  │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTPS API
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Supabase后端服务                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │认证服务  │  │数据库   │  │存储服务  │  │实时订阅  │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        部署层                                │
│                    Netlify (CDN + CI/CD)                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 数据流转流程
```
用户上传Excel → 前端解析 → 数据验证 → API请求 → Supabase存储
                                              ↓
大屏展示 ← 实时订阅 ← 数据聚合 ← 触发器更新 ← 数据入库
```

## 4. UI/UX设计原型

### 4.1 设计原则
- **工业化风格**：深色背景、高对比度、专业感
- **数据优先**：突出数据展示，减少装饰元素
- **响应式设计**：适配多种屏幕尺寸
- **交互友好**：操作简单直观，反馈及时

### 4.2 色彩方案
- 主背景：#0A0E27（深蓝黑）
- 卡片背景：#1A1F3A（深蓝）
- 主色调：#00D4FF（亮蓝）
- 成功色：#00FF88（绿）
- 警告色：#FFB800（橙）
- 危险色：#FF3838（红）

### 4.3 页面原型

#### 4.3.1 登录页面
```
┌─────────────────────────────────────┐
│          系统LOGO                   │
│    ┌─────────────────────┐         │
│    │  用户名/邮箱        │         │
│    └─────────────────────┘         │
│    ┌─────────────────────┐         │
│    │  密码               │         │
│    └─────────────────────┘         │
│    ┌─────────────────────┐         │
│    │     登录按钮        │         │
│    └─────────────────────┘         │
└─────────────────────────────────────┘
```

#### 4.3.2 大屏展示页面
```
┌─────────────────────────────────────────────────────┐
│  系统标题                          时间  用户信息    │
├─────────────────────┬───────────────────────────────┤
│   实时数据卡片      │      实时趋势曲线             │
│  ┌──────┬──────┐   │   ┌─────────────────────┐    │
│  │电压  │电流  │   │   │     曲线图表         │    │
│  │20.5V │0.26A │   │   │                     │    │
│  └──────┴──────┘   │   └─────────────────────┘    │
│  ┌──────┬──────┐   │                               │
│  │功率  │阻值  │   │                               │
│  │5.3W  │78.8Ω │   │                               │
│  └──────┴──────┘   │                               │
├─────────────────────┼───────────────────────────────┤
│   实验统计分布      │      异常预警与消息           │
│  ┌─────────────┐   │   ┌─────────────────────┐    │
│  │ 饼图/柱状图 │   │   │  预警信息列表       │    │
│  └─────────────┘   │   └─────────────────────┘    │
└─────────────────────┴───────────────────────────────┘
```

## 5. 数据库设计

### 5.1 数据表结构

#### 5.1.1 users（用户表）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'researcher',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.1.2 experiments（实验表）
```sql
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name VARCHAR(255) NOT NULL,
  description TEXT,
  operator_id UUID REFERENCES users(id),
  operator_name VARCHAR(100),
  device_address VARCHAR(50),
  device_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.1.3 experiment_data（实验数据表）
```sql
CREATE TABLE experiment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  sequence_number INTEGER,
  timestamp TIMESTAMPTZ NOT NULL,
  voltage DECIMAL(10, 5),
  current DECIMAL(10, 5),
  power DECIMAL(10, 5),
  resistance DECIMAL(10, 5),
  temperature DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX idx_experiment_data_experiment_id ON experiment_data(experiment_id);
CREATE INDEX idx_experiment_data_timestamp ON experiment_data(timestamp);
```

#### 5.1.4 overview_metrics（总览指标表）
```sql
CREATE TABLE overview_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE DEFAULT CURRENT_DATE,
  total_experiments INTEGER DEFAULT 0,
  total_data_points INTEGER DEFAULT 0,
  avg_voltage DECIMAL(10, 5),
  avg_current DECIMAL(10, 5),
  avg_power DECIMAL(10, 5),
  max_voltage DECIMAL(10, 5),
  max_current DECIMAL(10, 5),
  max_power DECIMAL(10, 5),
  min_voltage DECIMAL(10, 5),
  min_current DECIMAL(10, 5),
  min_power DECIMAL(10, 5),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.1.5 alerts（预警记录表）
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 5),
  actual_value DECIMAL(10, 5),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

### 5.2 数据库触发器和函数

#### 5.2.1 自动计算功率
```sql
CREATE OR REPLACE FUNCTION calculate_power()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voltage IS NOT NULL AND NEW.current IS NOT NULL THEN
    NEW.power = NEW.voltage * NEW.current;
  END IF;
  
  IF NEW.voltage IS NOT NULL AND NEW.current IS NOT NULL AND NEW.current > 0 THEN
    NEW.resistance = NEW.voltage / NEW.current;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_power
BEFORE INSERT OR UPDATE ON experiment_data
FOR EACH ROW
EXECUTE FUNCTION calculate_power();
```

#### 5.2.2 更新总览指标
```sql
CREATE OR REPLACE FUNCTION update_overview_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO overview_metrics (
    metric_date,
    total_experiments,
    total_data_points,
    avg_voltage,
    avg_current,
    avg_power,
    max_voltage,
    max_current,
    max_power,
    min_voltage,
    min_current,
    min_power
  )
  SELECT
    CURRENT_DATE,
    COUNT(DISTINCT e.id),
    COUNT(ed.id),
    AVG(ed.voltage),
    AVG(ed.current),
    AVG(ed.power),
    MAX(ed.voltage),
    MAX(ed.current),
    MAX(ed.power),
    MIN(ed.voltage),
    MIN(ed.current),
    MIN(ed.power)
  FROM experiments e
  LEFT JOIN experiment_data ed ON e.id = ed.experiment_id
  WHERE DATE(ed.created_at) = CURRENT_DATE
  ON CONFLICT (metric_date)
  DO UPDATE SET
    total_experiments = EXCLUDED.total_experiments,
    total_data_points = EXCLUDED.total_data_points,
    avg_voltage = EXCLUDED.avg_voltage,
    avg_current = EXCLUDED.avg_current,
    avg_power = EXCLUDED.avg_power,
    max_voltage = EXCLUDED.max_voltage,
    max_current = EXCLUDED.max_current,
    max_power = EXCLUDED.max_power,
    min_voltage = EXCLUDED.min_voltage,
    min_current = EXCLUDED.min_current,
    min_power = EXCLUDED.min_power,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_metrics
AFTER INSERT OR UPDATE OR DELETE ON experiment_data
FOR EACH STATEMENT
EXECUTE FUNCTION update_overview_metrics();
```

## 6. 技术架构详细说明

### 6.1 前端技术栈
- **框架**: Next.js 14+ (App Router)
- **样式**: TailwindCSS + shadcn/ui
- **状态管理**: Zustand
- **图表库**: Recharts + Chart.js
- **表单处理**: React Hook Form + Zod
- **文件处理**: xlsx (Excel解析)
- **PDF生成**: jsPDF + html2canvas
- **实时通信**: Supabase Realtime

### 6.2 后端技术栈
- **数据库**: PostgreSQL (via Supabase)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **API**: Supabase REST API + RPC
- **实时更新**: Supabase Realtime Subscriptions

### 6.3 部署架构
- **托管平台**: Netlify
- **CI/CD**: GitHub Actions + Netlify CLI
- **环境变量**: Netlify Environment Variables
- **域名**: 自定义域名 + SSL证书

### 6.4 性能优化策略
- **前端优化**:
  - 代码分割和懒加载
  - 图片优化（WebP格式）
  - 静态页面生成（SSG）
  - 增量静态再生（ISR）
- **数据库优化**:
  - 合理的索引设计
  - 数据分区（按时间）
  - 查询优化
  - 连接池管理

## 7. 安全性设计

### 7.1 认证与授权
- JWT令牌验证
- 角色基础访问控制（RBAC）
- 会话管理和超时设置
- 多因素认证（可选）

### 7.2 数据安全
- HTTPS加密传输
- 数据库字段加密（敏感信息）
- SQL注入防护
- XSS攻击防护

### 7.3 API安全
- Rate Limiting
- API密钥管理
- CORS配置
- 请求签名验证

## 8. 风险评估与应对

### 8.1 技术风险
| 风险项 | 影响程度 | 应对措施 |
|--------|----------|----------|
| 大数据量性能问题 | 高 | 数据分页、索引优化、缓存策略 |
| 实时数据延迟 | 中 | WebSocket优化、数据聚合 |
| Excel解析兼容性 | 中 | 多格式支持、错误处理 |
| 并发访问冲突 | 低 | 乐观锁、事务处理 |

### 8.2 业务风险
| 风险项 | 影响程度 | 应对措施 |
|--------|----------|----------|
| 数据丢失 | 高 | 定期备份、数据恢复机制 |
| 权限泄露 | 高 | 严格的权限控制、审计日志 |
| 系统宕机 | 中 | 监控告警、快速恢复 |

## 9. 项目计划与里程碑

### 9.1 开发阶段
1. **Phase 1 - 基础架构（第1-2周）**
   - 项目初始化
   - 数据库设计与创建
   - 基础UI框架搭建
   - 认证系统实现

2. **Phase 2 - 核心功能（第3-5周）**
   - Excel上传解析
   - 数据管理CRUD
   - 基础图表展示
   - 权限控制

3. **Phase 3 - 高级功能（第6-7周）**
   - 大屏展示系统
   - 实时数据更新
   - 报告导出功能
   - 性能优化

4. **Phase 4 - 测试部署（第8周）**
   - 全面测试
   - 部署配置
   - 文档完善
   - 上线发布

### 9.2 验收标准
- 所有功能模块正常运行
- 性能指标达到要求
- 安全测试通过
- 用户培训完成

## 10. 维护与运营

### 10.1 日常维护
- 数据备份（每日）
- 性能监控（实时）
- 安全巡检（每周）
- 版本更新（按需）

### 10.2 技术支持
- 7×24小时监控告警
- 问题响应SLA
- 定期系统优化
- 用户培训支持

## 11. 附录

### 11.1 示例数据格式
```
Excel数据示例：
序号  电流(A)  电压(V)  功率(W)  时间戳     设备地址  设备类型
1     0.11     20.355   2.239    2025/5/2   1        未知
2     0.26     20.681   5.377    2025/5/2   1        未知
```

### 11.2 API接口文档
详见项目API文档

### 11.3 部署配置说明
详见部署手册

---

**文档版本**: v1.0
**更新日期**: 2025-01-14
**编写人**: 系统架构师