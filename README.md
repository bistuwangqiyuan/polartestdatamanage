# 光伏关断器电压电流实验检测数据管理与大屏展示系统

## 📋 项目简介

本项目是一个专为光伏关断器实验室设计的现代化数据管理与可视化系统。系统支持Excel数据批量上传、实时数据监控、多维度数据分析以及专业的工业化大屏展示，大幅提升实验数据管理效率和分析能力。

### 核心特性

- 🚀 **现代技术栈**: Next.js 14 + Supabase + TailwindCSS
- 📊 **实时可视化**: 动态图表展示电压/电流/功率趋势
- 🏭 **工业化大屏**: 专业的数据总览展示系统
- 📤 **批量数据导入**: 支持Excel文件解析和批量上传
- 📈 **智能分析**: 自动计算统计指标，异常预警
- 📑 **报告导出**: 一键生成PDF/Excel实验报告
- 🔐 **权限管理**: 基于角色的访问控制
- ☁️ **云端部署**: Netlify托管，全球CDN加速

## 🛠️ 技术架构

### 前端技术
- **框架**: Next.js 14 (App Router)
- **UI库**: shadcn/ui + TailwindCSS
- **图表**: Recharts + Chart.js
- **状态管理**: Zustand
- **表单验证**: React Hook Form + Zod
- **文件处理**: xlsx

### 后端服务
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时通信**: Supabase Realtime
- **API**: RESTful + GraphQL

### 部署方案
- **托管**: Netlify
- **CDN**: Netlify Edge
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-repo/pv-data-system.git
cd pv-data-system
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **数据库初始化**
```bash
npm run db:init
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000 查看系统

## 📁 项目结构

```
pv-data-system/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── (dashboard)/       # 仪表板页面
│   ├── api/               # API路由
│   └── layout.tsx         # 根布局
├── components/            # React组件
│   ├── ui/               # UI基础组件
│   ├── charts/           # 图表组件
│   ├── forms/            # 表单组件
│   └── layouts/          # 布局组件
├── lib/                   # 工具库
│   ├── supabase/         # Supabase客户端
│   ├── utils/            # 工具函数
│   └── validations/      # 验证规则
├── hooks/                 # React Hooks
├── store/                 # Zustand状态管理
├── types/                 # TypeScript类型定义
├── public/                # 静态资源
└── styles/               # 全局样式
```

## 💾 数据库设计

### 主要数据表

1. **users** - 用户信息表
2. **experiments** - 实验记录表
3. **experiment_data** - 实验数据详情表
4. **overview_metrics** - 统计指标表
5. **alerts** - 预警记录表

详细的数据库设计请参考 [数据库文档](./docs/database.md)

## 🔧 功能模块

### 1. 用户认证
- 注册/登录
- 角色权限管理
- 会话管理

### 2. 数据管理
- Excel文件上传
- 数据批量导入
- 数据查询筛选
- 数据编辑删除

### 3. 数据可视化
- 实时趋势图
- 数据对比分析
- 统计报表
- 异常数据标记

### 4. 大屏展示
- 实时数据卡片
- 动态图表展示
- 关键指标监控
- 全屏模式

### 5. 报告导出
- PDF实验报告
- Excel数据导出
- 自定义模板

## 📊 数据格式说明

### Excel导入格式
系统支持以下格式的Excel文件：

```
序号 | 电流(A) | 电压(V) | 功率(W) | 时间戳    | 设备地址 | 设备类型
1    | 0.11    | 20.355  | 2.239   | 2025/5/2 | 1       | 未知
2    | 0.26    | 20.681  | 5.377   | 2025/5/2 | 1       | 未知
```

## 🔒 安全性

- HTTPS加密传输
- JWT令牌认证
- 基于角色的访问控制
- SQL注入防护
- XSS攻击防护
- 敏感数据加密存储

## 🚀 部署指南

### Netlify部署

1. **连接GitHub仓库**
2. **配置构建设置**：
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **设置环境变量**
4. **部署**

### 环境变量配置
在Netlify控制台设置以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📝 API文档

API文档使用Swagger生成，开发环境下访问：
```
http://localhost:3000/api-docs
```

## 🧪 测试

```bash
# 运行单元测试
npm run test

# 运行端到端测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

## 🛠️ 开发指南

### 代码规范
- 使用ESLint和Prettier进行代码格式化
- 遵循TypeScript严格模式
- 组件使用函数式组件和Hooks

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📈 性能优化

- 图片懒加载
- 代码分割
- 静态页面生成(SSG)
- 增量静态再生(ISR)
- API响应缓存
- 数据库查询优化

## 🔍 SEO优化

系统已进行全面的SEO优化，确保在搜索引擎中获得更好的排名和曝光：

### 核心SEO功能
- ✅ **完整的Metadata配置**: 包含Open Graph、Twitter Card等社交媒体优化标签
- ✅ **robots.txt**: 指导搜索引擎爬虫的抓取规则
- ✅ **动态Sitemap**: 自动生成XML网站地图，包含所有主要页面
- ✅ **结构化数据**: JSON-LD格式的WebApplication和BreadcrumbList Schema
- ✅ **PWA支持**: 完整的manifest.json配置，支持添加到主屏幕
- ✅ **性能优化**: 图片优化、代码压缩、缓存策略
- ✅ **安全头部**: HSTS、CSP、XSS防护等安全配置
- ✅ **URL规范化**: 强制HTTPS、删除尾部斜杠
- ✅ **移动优先**: 响应式设计，移动端友好

### SEO详细文档
- 完整优化报告：`docs/SEO_OPTIMIZATION.md`
- 图标生成指南：`docs/FAVICON_GUIDE.md`

### 预期SEO评分
- Google技术SEO：100/100
- 内容SEO：95/100
- 性能SEO：90/100

详见 [SEO优化文档](./docs/SEO_OPTIMIZATION.md)

## 🤝 贡献指南

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 团队

- 产品经理：定义产品需求和功能规划
- 全栈工程师：系统架构设计和功能实现
- UI/UX设计师：界面设计和用户体验优化
- 测试工程师：质量保证和测试

## 📞 联系支持

- 邮箱：support@pv-system.com
- 文档：https://docs.pv-system.com
- 问题反馈：[GitHub Issues](https://github.com/your-repo/issues)

## 🔄 更新日志

### v1.0.0 (2025-01-14)
- 🎉 首次发布
- ✨ 实现基础数据管理功能
- 📊 添加数据可视化模块
- 🏭 完成大屏展示系统
- 📑 支持报告导出功能

---

**项目持续更新中，欢迎提出建议和反馈！**