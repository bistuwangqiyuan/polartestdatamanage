'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { FileText, Download, Loader2, Calendar, FileSpreadsheet } from 'lucide-react'
import { Experiment } from '@/types'
import { formatDate } from '@/lib/utils'
import { generatePDFReport } from '@/lib/report-generator'

export default function ReportsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<string>('')
  const [reportType, setReportType] = useState<'pdf' | 'excel'>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchExperiments()
  }, [])

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setExperiments(data || [])
    } catch (error) {
      console.error('Error fetching experiments:', error)
      toast({
        title: '获取实验列表失败',
        description: '请刷新页面重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedExperiment) {
      toast({
        title: '请选择实验',
        description: '请先选择要生成报告的实验',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      // 获取实验详情
      const experiment = experiments.find(e => e.id === selectedExperiment)
      if (!experiment) throw new Error('实验不存在')

      // 获取实验数据
      const { data: experimentData, error: dataError } = await supabase
        .from('experiment_data')
        .select('*')
        .eq('experiment_id', selectedExperiment)
        .order('sequence_number')

      if (dataError) throw dataError

      if (reportType === 'pdf') {
        // 生成PDF报告
        await generatePDFReport(experiment, experimentData || [])
        
        toast({
          title: '报告生成成功',
          description: 'PDF报告已开始下载',
        })
      } else {
        // 生成Excel报告
        const csvContent = [
          // 报告头部信息
          ['实验报告'],
          [''],
          ['实验名称:', experiment.experiment_name],
          ['操作员:', experiment.operator_name || '未知'],
          ['设备类型:', experiment.device_type || '未知'],
          ['设备地址:', experiment.device_address || '未知'],
          ['创建时间:', formatDate(experiment.created_at)],
          [''],
          // 数据表头
          ['序号', '时间戳', '电压(V)', '电流(A)', '功率(W)', '阻值(Ω)', '温度(℃)'],
          // 数据行
          ...(experimentData || []).map(row => [
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
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${experiment.experiment_name}_报告_${new Date().toISOString().split('T')[0]}.csv`
        link.click()

        toast({
          title: '报告生成成功',
          description: 'Excel报告已开始下载',
        })
      }
    } catch (error: any) {
      console.error('Error generating report:', error)
      toast({
        title: '报告生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold industrial-gradient-text">报告生成</h1>
        <p className="text-gray-400 mt-2">生成实验数据报告和分析文档</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 报告设置 */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-industrial-primary">报告设置</CardTitle>
            <CardDescription className="text-gray-400">
              选择实验和报告格式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="experiment-select">选择实验</Label>
              <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
                <SelectTrigger 
                  id="experiment-select"
                  className="bg-industrial-bg border-industrial-primary/30"
                >
                  <SelectValue placeholder="请选择实验..." />
                </SelectTrigger>
                <SelectContent className="bg-industrial-card border-industrial-primary/20">
                  {experiments.map(exp => (
                    <SelectItem key={exp.id} value={exp.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{exp.experiment_name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDate(exp.created_at).split(' ')[0]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>报告格式</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={reportType === 'pdf' ? 'default' : 'outline'}
                  className={reportType === 'pdf' 
                    ? 'bg-industrial-primary text-black hover:bg-industrial-primary/80' 
                    : 'border-industrial-primary/30'
                  }
                  onClick={() => setReportType('pdf')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF格式
                </Button>
                <Button
                  variant={reportType === 'excel' ? 'default' : 'outline'}
                  className={reportType === 'excel' 
                    ? 'bg-industrial-primary text-black hover:bg-industrial-primary/80' 
                    : 'border-industrial-primary/30'
                  }
                  onClick={() => setReportType('excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel格式
                </Button>
              </div>
            </div>

            {selectedExperiment && (
              <Card className="bg-industrial-bg border-industrial-primary/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">实验信息</h4>
                  {experiments
                    .filter(e => e.id === selectedExperiment)
                    .map(exp => (
                      <div key={exp.id} className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">实验名称:</span>
                          <span className="text-white">{exp.experiment_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">操作员:</span>
                          <span className="text-white">{exp.operator_name || '未知'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">设备类型:</span>
                          <span className="text-white">{exp.device_type || '未知'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">创建时间:</span>
                          <span className="text-white">{formatDate(exp.created_at)}</span>
                        </div>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleGenerateReport}
              disabled={!selectedExperiment || isGenerating}
              className="w-full bg-industrial-success text-black hover:bg-industrial-success/80"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  生成报告
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 报告说明 */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-industrial-warning">报告内容说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-industrial-primary mb-2">PDF报告包含：</h4>
              <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                <li>实验基本信息</li>
                <li>数据统计分析（平均值、最大值、最小值）</li>
                <li>电压/电流/功率趋势图表</li>
                <li>数据分布图</li>
                <li>异常数据标记</li>
                <li>实验结论和建议</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-industrial-success mb-2">Excel报告包含：</h4>
              <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                <li>实验基本信息</li>
                <li>完整的原始数据表</li>
                <li>所有数据点的详细记录</li>
                <li>可用于进一步数据分析</li>
                <li>支持数据筛选和排序</li>
              </ul>
            </div>

            <Card className="bg-industrial-bg border-industrial-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-industrial-warning mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">使用提示</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      报告生成可能需要几秒钟时间，请耐心等待。生成完成后将自动下载到您的设备。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}