# Netlify 部署检查清单

## 部署前检查

### 1. 项目文件检查 ✅
- [x] `package.json` - 包含所有依赖和构建脚本
- [x] `netlify.toml` - Netlify 配置文件
- [x] `.gitignore` - Git 忽略文件
- [x] `next.config.js` - Next.js 配置
- [x] 数据库迁移文件 - `/supabase/migrations/`

### 2. 环境变量准备
需要在 Netlify 中设置以下环境变量：
```
NEXT_PUBLIC_SUPABASE_URL = [你的 Supabase URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [你的 Supabase 匿名密钥]
SUPABASE_SERVICE_ROLE_KEY = [你的 Supabase 服务密钥]
```

### 3. Git 仓库状态
- [ ] 所有更改已提交
- [ ] 代码已推送到 GitHub
- [ ] 主分支（main/master）是最新的

### 4. Supabase 设置
- [ ] Supabase 项目已创建
- [ ] 数据库表已创建（使用迁移文件）
- [ ] Row Level Security (RLS) 策略已配置
- [ ] 认证设置已完成

## 部署步骤

### 第一步：准备 GitHub 仓库
```bash
# 如果还没有初始化 Git
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/[你的用户名]/[仓库名].git

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit for PV Data Management System"

# 推送到 GitHub
git push -u origin main
```

### 第二步：在 Netlify 部署

1. **登录 Netlify**
   - 访问 https://app.netlify.com
   - 使用 GitHub 账号登录

2. **创建新站点**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 "Deploy with GitHub"
   - 授权 Netlify 访问你的 GitHub

3. **选择仓库**
   - 在列表中找到你的项目仓库
   - 点击选择

4. **配置构建设置**
   Netlify 会自动读取 `netlify.toml`，但请确认：
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `.next`

5. **先不要点击部署！**

### 第三步：设置环境变量

1. 在部署页面底部找到 "Environment variables"
2. 点击 "New variable" 添加以下变量：
   
   | Key | Value |
   |-----|-------|
   | NEXT_PUBLIC_SUPABASE_URL | 你的 Supabase URL |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | 你的 Supabase 匿名密钥 |
   | SUPABASE_SERVICE_ROLE_KEY | 你的 Supabase 服务密钥 |

### 第四步：开始部署

1. 检查所有设置无误后，点击 "Deploy site"
2. 等待部署完成（约 2-5 分钟）
3. 部署成功后会获得一个临时域名

### 第五步：部署后设置

1. **配置 Supabase 认证回调**
   - 在 Supabase Dashboard → Authentication → URL Configuration
   - 添加 Netlify 域名到 "Redirect URLs"：
     - `https://[你的netlify域名].netlify.app/`

2. **测试功能**
   - [ ] 访问首页
   - [ ] 测试登录功能
   - [ ] 测试数据上传
   - [ ] 测试图表显示
   - [ ] 测试大屏展示

## 常见问题解决

### 1. 构建失败
- 检查环境变量是否正确设置
- 查看构建日志找到具体错误
- 尝试清除缓存重新部署

### 2. Supabase 连接错误
- 确认环境变量值没有多余空格
- 检查 Supabase 项目是否在运行
- 验证密钥是否正确

### 3. 页面 404 错误
- 等待几分钟让部署完全生效
- 检查路由配置是否正确

## 后续维护

### 更新代码
```bash
# 本地修改后
git add .
git commit -m "更新说明"
git push

# Netlify 会自动触发新的部署
```

### 查看部署日志
- Netlify Dashboard → Deploys → 选择部署记录

### 回滚版本
- Netlify Dashboard → Deploys → 找到之前的版本 → Publish deploy

## 获取帮助

- Netlify 状态页：https://www.netlifystatus.com/
- Netlify 支持：https://www.netlify.com/support/
- 项目问题：在 GitHub 仓库提交 Issue