import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SupabaseProvider } from '@/components/providers/supabase-provider'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://polartestdatamanage.netlify.app'
const siteName = '光伏关断器实验数据管理系统'
const siteDescription = '专业的电压电流功率测试数据管理与可视化平台，支持Excel批量导入、实时数据监控、智能分析预警、工业级大屏展示和报告导出功能'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    '光伏关断器',
    '实验数据管理',
    '电压测试',
    '电流测试',
    '功率测试',
    '数据可视化',
    '大屏展示',
    '工业数据分析',
    'Excel数据导入',
    'Supabase',
    'Next.js',
    '实时监控',
    '智能预警',
    'PDF报告',
    '光伏测试系统',
    '电力测试平台'
  ],
  authors: [{ name: 'PV System Team', url: siteUrl }],
  creator: 'PV System Team',
  publisher: 'PV System Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/images/twitter-image.png`],
    creator: '@pvsystem',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#00D9FF' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  category: '工业软件',
  classification: '数据管理系统',
  applicationName: siteName,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteName,
  },
  verification: {
    // 谷歌搜索控制台验证码（需要在Google Search Console获取）
    // google: 'your-google-verification-code',
    // 百度站长验证码（需要在百度站长平台获取）
    // other: {
    //   'baidu-site-verification': 'your-baidu-verification-code',
    // },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
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