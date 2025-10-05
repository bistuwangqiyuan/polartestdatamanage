'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  MoreVertical,
  Activity,
  Calendar,
  User,
  MapPin
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Experiment } from '@/types'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  
  const { toast } = useToast()
  const { supabase, user } = useSupabase()

  useEffect(() => {
    fetchExperiments()
    fetchUserRole()
    
    // 设置实时订阅
    const channel = supabase
      .channel('experiments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experiments',
        },
        () => {
          fetchExperiments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchUserRole = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setUserRole(data.role)
    }
  }

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          experiment_data!inner(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // 获取每个实验的数据点数量
      const experimentsWithCount = await Promise.all(
        (data || []).map(async (exp) => {
          const { count } = await supabase
            .from('experiment_data')
            .select('*', { count: 'exact', head: true })
            .eq('experiment_id', exp.id)
          
          return { ...exp, dataCount: count || 0 }
        })
      )
      
      setExperiments(experimentsWithCount)
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

  const handleDelete = async () => {
    if (!selectedExperiment) return
    
    try {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', selectedExperiment.id)

      if (error) throw error

      toast({
        title: '删除成功',
        description: '实验及相关数据已删除',
      })
      
      setDeleteDialogOpen(false)
      setSelectedExperiment(null)
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  const handleExport = async (experiment: Experiment) => {
    try {
      // 获取实验数据
      const { data, error } = await supabase
        .from('experiment_data')
        .select('*')
        .eq('experiment_id', experiment.id)
        .order('sequence_number')

      if (error) throw error

      // 转换为CSV格式
      const csvContent = [
        ['序号', '时间戳', '电压(V)', '电流(A)', '功率(W)', '阻值(Ω)'],
        ...data.map(row => [
          row.sequence_number,
          row.timestamp,
          row.voltage,
          row.current,
          row.power,
          row.resistance || '',
        ])
      ].map(row => row.join(',')).join('\n')

      // 下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${experiment.experiment_name}_${new Date().toISOString().split('T')[0]}.csv`
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

  const filteredExperiments = experiments.filter(exp =>
    exp.experiment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.device_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.operator_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-industrial-success'
      case 'completed':
        return 'text-industrial-primary'
      case 'archived':
        return 'text-gray-500'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中'
      case 'completed':
        return '已完成'
      case 'archived':
        return '已归档'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold industrial-gradient-text">实验管理</h1>
        <p className="text-gray-400 mt-2">管理和查看所有实验数据</p>
      </div>

      {/* 搜索和筛选栏 */}
      <Card className="industrial-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索实验名称、设备类型或操作员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-industrial-bg border-industrial-primary/30"
              />
            </div>
            <Button variant="outline" className="border-industrial-primary/30">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 实验列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-industrial-primary"></div>
        </div>
      ) : filteredExperiments.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="text-center py-12">
            <p className="text-gray-400">暂无实验数据</p>
            <Link href="/dashboard/upload">
              <Button className="mt-4 bg-industrial-primary text-black hover:bg-industrial-primary/80">
                上传数据
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((experiment) => (
            <Card key={experiment.id} className="data-card hover:scale-[1.02] transition-transform">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{experiment.experiment_name}</CardTitle>
                    <CardDescription className={getStatusColor(experiment.status)}>
                      {getStatusText(experiment.status)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-industrial-card border-industrial-primary/20">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/experiments/${experiment.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(experiment)}>
                        <Download className="mr-2 h-4 w-4" />
                        导出数据
                      </DropdownMenuItem>
                      {userRole === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-industrial-danger focus:text-industrial-danger"
                            onClick={() => {
                              setSelectedExperiment(experiment)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除实验
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-400">
                    <User className="mr-2 h-4 w-4" />
                    <span className="truncate">{experiment.operator_name || '未知'}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Activity className="mr-2 h-4 w-4" />
                    <span>{(experiment as any).dataCount || 0} 数据点</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{experiment.device_type || '未知设备'}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="truncate">{formatDate(experiment.created_at).split(' ')[0]}</span>
                  </div>
                </div>
                {experiment.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {experiment.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-industrial-card border-industrial-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除实验 &ldquo;{selectedExperiment?.experiment_name}&rdquo; 吗？
              此操作将同时删除所有相关的实验数据，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-industrial-bg border-industrial-primary/30">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-industrial-danger hover:bg-industrial-danger/80"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}