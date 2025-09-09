import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SupabaseProvider } from '@/components/providers/supabase-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '光伏关断器实验数据管理系统',
  description: '专业的电压电流功率测试数据管理与可视化平台',
  keywords: '光伏关断器,实验数据,电压测试,电流测试,数据管理,大屏展示',
  authors: [{ name: 'PV System Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0A0E27',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} bg-industrial-bg text-white min-h-screen`}>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  )
}