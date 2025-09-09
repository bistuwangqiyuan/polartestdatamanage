'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { 
  ArrowLeft, 
  Download, 
  Activity,
  Zap,
  TrendingUp,
  Calendar,
  User,
  MapPin
} from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { Experiment, ExperimentDataPoint } from '@/types'
import dynamic from 'next/dynamic'

// 动态导入图表组件
const ExperimentChart = dynamic(() => import('@/components/charts/experiment-chart'), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center text-gray-400">加载图表中...</div>
})

export default function ExperimentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [dataPoints, setDataPoints] = useState<ExperimentDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    avgVoltage: 0,
    avgCurrent: 0,
    avgPower: 0,
    maxVoltage: 0,
    maxCurrent: 0,
    maxPower: 0,
    minVoltage: 0,
    minCurrent: 0,
    minPower: 0,
  })
  
  const { toast } = useToast()
  const { supabase } = useSupabase()

  useEffect(() => {
    if (params.id) {
      fetchExperimentDetails()
    }
  }, [params.id])

  const fetchExperimentDetails = async () => {
    try {
      // 获取实验信息
      const { data: expData, error: expError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', params.id)
        .single()

      if (expError) throw expError
      setExperiment(expData)

      // 获取实验数据
      const { data: dataPoints, error: dataError } = await supabase
        .from('experiment_data')
        .select('*')
        .eq('experiment_id', params.id)
        .order('sequence_number')

      if (dataError) throw dataError
      setDataPoints(dataPoints || [])

      // 计算统计数据
      if (dataPoints && dataPoints.length > 0) {
        const voltages = dataPoints.map(d => d.voltage || 0)
        const currents = dataPoints.map(d => d.current || 0)
        const powers = dataPoints.map(d => d.power || 0)

        setStats({
          avgVoltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
          avgCurrent: currents.reduce((a, b) => a + b, 0) / currents.length,
          avgPower: powers.reduce((a, b) => a + b, 0) / powers.length,
          maxVoltage: Math.max(...voltages),
          maxCurrent: Math.max(...currents),
          maxPower: Math.max(...powers),
          minVoltage: Math.min(...voltages),
          minCurrent: Math.min(...currents),
          minPower: Math.min(...powers),
        })
      }
    } catch (error) {
      console.error('Error fetching experiment details:', error)
      toast({
        title: '获取实验详情失败',
        description: '请刷新页面重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      // 转换为CSV格式
      const csvContent = [
        ['序号', '时间戳', '电压(V)', '电流(A)', '功率(W)', '阻值(Ω)', '温度(℃)'],
        ...dataPoints.map(row => [
          row.sequence_number,
          row.timestamp,
          row.voltage,
          row.current,
          row.power,
          row.resistance || '',
          row.temperature || '',
        ])
      ].map(row => row.join(',')).join('\n')

      // 下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${experiment?.experiment_name}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      toast({
        title: '导出成功',
        description: '数据已导出为CSV文件',
      })
    } catch (error) {
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-primary"></div>
      </div>
    )
  }

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">实验不存在</p>
        <Button onClick={() => router.push('/dashboard/experiments')}>
          返回实验列表
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/experiments')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold industrial-gradient-text">
              {experiment.experiment_name}
            </h1>
            <p className="text-gray-400 mt-1">{experiment.description || '暂无描述'}</p>
          </div>
        </div>
        <Button onClick={handleExport} className="bg-industrial-primary text-black hover:bg-industrial-primary/80">
          <Download className="mr-2 h-4 w-4" />
          导出数据
        </Button>
      </div>

      {/* 实验信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="data-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-gray-400">
              <User className="mr-2 h-4 w-4" />
              操作员
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{experiment.operator_name || '未知'}</p>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-gray-400">
              <MapPin className="mr-2 h-4 w-4" />
              设备信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{experiment.device_type || '未知设备'}</p>
            <p className="text-sm text-gray-500">地址: {experiment.device_address || '-'}</p>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-gray-400">
              <Activity className="mr-2 h-4 w-4" />
              数据点
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{dataPoints.length} 条</p>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-gray-400">
              <Calendar className="mr-2 h-4 w-4" />
              创建时间
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(experiment.created_at).split(' ')[0]}</p>
            <p className="text-sm text-gray-500">{formatDate(experiment.created_at).split(' ')[1]}</p>
          </CardContent>
        </Card>
      </div>

      {/* 统计数据 */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="text-industrial-primary">数据统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 电压统计 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                电压 (V)
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">最小值</p>
                  <p className="text-lg font-semibold text-industrial-danger">
                    {formatNumber(stats.minVoltage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">平均值</p>
                  <p className="text-lg font-semibold text-industrial-primary">
                    {formatNumber(stats.avgVoltage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">最大值</p>
                  <p className="text-lg font-semibold text-industrial-success">
                    {formatNumber(stats.maxVoltage)}
                  </p>
                </div>
              </div>
            </div>

            {/* 电流统计 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                电流 (A)
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">最小值</p>
                  <p className="text-lg font-semibold text-industrial-danger">
                    {formatNumber(stats.minCurrent, 3)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">平均值</p>
                  <p className="text-lg font-semibold text-industrial-primary">
                    {formatNumber(stats.avgCurrent, 3)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">最大值</p>
                  <p className="text-lg font-semibold text-industrial-success">
                    {formatNumber(stats.maxCurrent, 3)}
                  </p>
                </div>
              </div>
            </div>

            {/* 功率统计 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                功率 (W)
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">最小值</p>
                  <p className="text-lg font-semibold text-industrial-danger">
                    {formatNumber(stats.minPower)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">平均值</p>
                  <p className="text-lg font-semibold text-industrial-primary">
                    {formatNumber(stats.avgPower)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">最大值</p>
                  <p className="text-lg font-semibold text-industrial-success">
                    {formatNumber(stats.maxPower)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据图表 */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="text-industrial-success">数据趋势图</CardTitle>
          <CardDescription className="text-gray-400">
            展示电压、电流、功率随时间的变化趋势
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExperimentChart data={dataPoints} />
        </CardContent>
      </Card>

      {/* 数据表格预览 */}
      <Card className="industrial-card">
        <CardHeader>
          <CardTitle className="text-industrial-warning">数据预览（前20条）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-industrial-primary/20">
                  <th className="text-left p-2 text-gray-400">序号</th>
                  <th className="text-left p-2 text-gray-400">电压 (V)</th>
                  <th className="text-left p-2 text-gray-400">电流 (A)</th>
                  <th className="text-left p-2 text-gray-400">功率 (W)</th>
                  <th className="text-left p-2 text-gray-400">阻值 (Ω)</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.slice(0, 20).map((point) => (
                  <tr key={point.id} className="border-b border-industrial-primary/10">
                    <td className="p-2">{point.sequence_number}</td>
                    <td className="p-2">{formatNumber(point.voltage || 0)}</td>
                    <td className="p-2">{formatNumber(point.current || 0, 3)}</td>
                    <td className="p-2">{formatNumber(point.power || 0)}</td>
                    <td className="p-2">{point.resistance ? formatNumber(point.resistance) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dataPoints.length > 20 && (
              <p className="text-center text-gray-400 text-sm mt-4">
                还有 {dataPoints.length - 20} 条数据未显示，请导出查看完整数据
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}