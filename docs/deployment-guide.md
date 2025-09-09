# Netlify 部署指南

## 前置要求

1. GitHub 账号
2. Netlify 账号
3. 项目代码已推送到 GitHub

## 部署步骤

### 1. 准备项目

确保项目根目录包含以下文件：
- `package.json` - 项目依赖配置
- `netlify.toml` - Netlify 部署配置
- `.gitignore` - Git 忽略文件配置

### 2. 登录 Netlify

1. 访问 [Netlify](https://www.netlify.com)
2. 使用 GitHub 账号登录

### 3. 创建新站点

1. 点击 "Add new site" → "Import an existing project"
2. 选择 "Deploy with GitHub"
3. 授权 Netlify 访问您的 GitHub 仓库
4. 选择包含本项目的仓库

### 4. 配置构建设置

Netlify 会自动检测 `netlify.toml` 文件，但您需要确认以下设置：

- **Branch to deploy**: `main` 或 `master`
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### 5. 设置环境变量

在 Netlify 控制台中设置以下环境变量：

1. 进入 "Site settings" → "Environment variables"
2. 添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL = https://zzyueuweeoakopuuwfau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: 请使用您自己的 Supabase 项目凭据

### 6. 部署站点

1. 点击 "Deploy site" 开始部署
2. 等待构建完成（通常需要 2-5 分钟）
3. 构建成功后，您将获得一个临时域名

### 7. 配置自定义域名（可选）

1. 进入 "Domain settings"
2. 点击 "Add custom domain"
3. 输入您的域名
4. 按照提示配置 DNS 记录

### 8. 启用自动部署

Netlify 默认启用自动部署。每次推送到主分支时，站点会自动更新。

## 部署后配置

### 1. 检查功能

部署完成后，请检查以下功能：

- [ ] 用户登录/注册
- [ ] 数据上传
- [ ] 图表显示
- [ ] 大屏展示
- [ ] 报告导出

### 2. 性能优化

1. **启用资产优化**
   - Site settings → Build & deploy → Post processing
   - 启用 "Bundle CSS" 和 "Minify JS"

2. **配置缓存**
   - 已在 `netlify.toml` 中配置

3. **启用预渲染**
   - Next.js 自动处理

### 3. 监控和日志

1. **查看构建日志**
   - Deploys → 选择部署 → View logs

2. **函数日志**
   - Functions → 选择函数 → View logs

3. **分析**
   - Analytics → 查看访问统计

## 常见问题

### 构建失败

1. **检查环境变量**
   - 确保所有必需的环境变量都已设置
   - 检查变量值是否正确（无多余空格）

2. **查看构建日志**
   - 查找具体错误信息
   - 常见错误：依赖安装失败、构建内存不足

3. **清除缓存重试**
   - Deploys → Trigger deploy → Clear cache and deploy site

### 运行时错误

1. **Supabase 连接失败**
   - 检查 Supabase URL 和密钥
   - 确保 Supabase 项目正在运行

2. **认证问题**
   - 检查 Supabase Auth 设置
   - 确保回调 URL 已配置

### 性能问题

1. **加载缓慢**
   - 启用 Netlify 的资产优化
   - 使用 Next.js 的图片优化

2. **函数超时**
   - 优化数据库查询
   - 考虑使用后台任务

## 更新和维护

### 更新依赖

```bash
# 本地更新依赖
npm update

# 提交更改
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

### 回滚部署

1. 进入 Deploys 页面
2. 找到之前的成功部署
3. 点击 "Publish deploy"

### 备份数据

定期备份 Supabase 数据库：
1. Supabase Dashboard → Settings → Backups
2. 下载备份文件
3. 存储在安全位置

## 安全建议

1. **定期更新依赖**
   - 使用 `npm audit` 检查漏洞
   - 及时修复安全问题

2. **限制 API 访问**
   - 在 Supabase 中配置 RLS 策略
   - 使用环境变量管理敏感信息

3. **监控异常活动**
   - 设置 Netlify 告警
   - 定期查看访问日志

## 支持资源

- [Netlify 文档](https://docs.netlify.com)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

## 联系支持

如遇到问题，请通过以下方式获取帮助：
- GitHub Issues
- support@pv-system.com