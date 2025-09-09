import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Database, FileSpreadsheet, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-industrial-bg via-industrial-card to-industrial-bg">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-industrial-primary" />
            <h1 className="text-2xl font-bold industrial-gradient-text">PV Data System</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-industrial-primary">
                登录
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-industrial-primary text-black hover:bg-industrial-primary/80">
                进入系统
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 pt-24">
        {/* Hero Section */}
        <section className="text-center py-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="industrial-gradient-text">光伏关断器</span>
            <br />
            <span className="text-white">实验数据管理系统</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            专业的电压/电流/功率测试数据管理与可视化平台
            <br />
            实时监控 · 智能分析 · 工业级展示
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-industrial-primary text-black hover:bg-industrial-primary/80">
                开始使用 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/display">
              <Button size="lg" variant="outline" className="border-industrial-primary text-industrial-primary hover:bg-industrial-primary/10">
                查看大屏
              </Button>
            </Link>
          </div>
        </section>

        {/* 特性展示 */}
        <section className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<FileSpreadsheet className="w-12 h-12 text-industrial-primary" />}
            title="批量数据导入"
            description="支持Excel文件快速导入，自动解析电压电流数据"
          />
          <FeatureCard
            icon={<BarChart3 className="w-12 h-12 text-industrial-success" />}
            title="实时数据可视化"
            description="动态图表展示，实时监控实验数据变化趋势"
          />
          <FeatureCard
            icon={<Database className="w-12 h-12 text-industrial-warning" />}
            title="智能数据分析"
            description="自动计算功率阻值，异常数据预警提醒"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-industrial-danger" />}
            title="安全权限管理"
            description="基于角色的访问控制，保障数据安全性"
          />
        </section>

        {/* 数据展示预览 */}
        <section className="py-20">
          <h3 className="text-3xl font-bold text-center mb-12">系统预览</h3>
          <div className="industrial-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DataPreviewCard
                label="平均电压"
                value="20.518"
                unit="V"
                trend="+2.3%"
                color="text-industrial-primary"
              />
              <DataPreviewCard
                label="平均电流"
                value="0.185"
                unit="A"
                trend="+1.2%"
                color="text-industrial-success"
              />
              <DataPreviewCard
                label="平均功率"
                value="3.796"
                unit="W"
                trend="+3.5%"
                color="text-industrial-warning"
              />
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-white/10 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 光伏关断器实验数据管理系统. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="data-card p-6 rounded-lg hover:scale-105 transition-transform duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function DataPreviewCard({ label, value, unit, trend, color }: {
  label: string
  value: string
  unit: string
  trend: string
  color: string
}) {
  return (
    <div className="text-center">
      <p className="text-gray-400 mb-2">{label}</p>
      <p className={`text-4xl font-bold ${color} neon-glow`}>
        {value}<span className="text-2xl ml-1">{unit}</span>
      </p>
      <p className="text-sm text-industrial-success mt-2">{trend}</p>
    </div>
  )
}