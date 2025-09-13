'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { ExcelRow } from '@/types'
import { generateExcelTemplate } from '@/lib/excel-template'

interface UploadResult {
  fileName: string
  status: 'success' | 'error'
  message: string
  dataCount?: number
}

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [experimentName, setExperimentName] = useState('')
  const [deviceAddress, setDeviceAddress] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  
  const { toast } = useToast()
  const { supabase, user } = useSupabase()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
      // 默认使用第一个文件名作为实验名称
      if (!experimentName) {
        setExperimentName(files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const parseExcelFile = async (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)
          
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsBinaryString(file)
    })
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的Excel文件',
        variant: 'destructive',
      })
      return
    }

    if (!experimentName.trim()) {
      toast({
        title: '请输入实验名称',
        description: '实验名称不能为空',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResults([])

    try {
      // 获取当前用户信息
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user?.id)
        .single()

      // 创建实验记录
      const { data: experiment, error: experimentError } = await supabase
        .from('experiments')
        .insert({
          experiment_name: experimentName,
          operator_id: user?.id,
          operator_name: userData?.name || '未知',
          device_address: deviceAddress || '1',
          device_type: deviceType || '未知',
          status: 'active',
        })
        .select()
        .single()

      if (experimentError) throw experimentError

      const results: UploadResult[] = []
      const totalFiles = selectedFiles.length

      // 处理每个文件
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i]
        setUploadProgress(((i + 1) / totalFiles) * 100)

        try {
          // 解析Excel文件
          const excelData = await parseExcelFile(file)
          
          if (excelData.length === 0) {
            results.push({
              fileName: file.name,
              status: 'error',
              message: '文件为空或格式不正确',
            })
            continue
          }

          // 转换数据格式并插入数据库
          const experimentData = excelData.map((row, index) => {
            // 处理时间戳
            let timestamp: string
            if (row['时间戳']) {
              // Excel日期可能是数字格式（Excel序列号）或字符串
              if (typeof row['时间戳'] === 'number') {
                // Excel序列号转换为日期
                const excelDate = new Date((row['时间戳'] - 25569) * 86400 * 1000)
                timestamp = excelDate.toISOString()
              } else {
                // 尝试解析字符串日期
                const parsedDate = new Date(row['时间戳'])
                timestamp = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString()
              }
            } else {
              timestamp = new Date().toISOString()
            }

            return {
              experiment_id: experiment.id,
              sequence_number: row['序号'] || index + 1,
              timestamp,
              voltage: parseFloat(String(row['电压 (V)'] || 0)),
              current: parseFloat(String(row['电流 (A)'] || 0)),
              // power 会由数据库触发器自动计算
            }
          })

          // 批量插入数据
          const batchSize = 100
          for (let j = 0; j < experimentData.length; j += batchSize) {
            const batch = experimentData.slice(j, j + batchSize)
            const { error: insertError } = await supabase
              .from('experiment_data')
              .insert(batch)

            if (insertError) throw insertError
          }

          results.push({
            fileName: file.name,
            status: 'success',
            message: '上传成功',
            dataCount: experimentData.length,
          })
        } catch (error: any) {
          results.push({
            fileName: file.name,
            status: 'error',
            message: error.message || '处理失败',
          })
        }
      }

      setUploadResults(results)
      
      // 显示总结
      const successCount = results.filter(r => r.status === 'success').length
      const totalDataPoints = results.reduce((sum, r) => sum + (r.dataCount || 0), 0)
      
      toast({
        title: '上传完成',
        description: `成功上传 ${successCount}/${totalFiles} 个文件，共 ${totalDataPoints} 条数据`,
      })

      // 清空表单
      setExperimentName('')
      setDeviceAddress('')
      setDeviceType('')
      setSelectedFiles(null)
      
      // 重置文件输入
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      toast({
        title: '上传失败',
        description: error.message || '请检查文件格式并重试',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold industrial-gradient-text">数据上传</h1>
        <p className="text-gray-400 mt-2">上传Excel文件导入实验数据</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 上传表单 */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-industrial-primary">上传设置</CardTitle>
            <CardDescription className="text-gray-400">
              配置实验信息并选择要上传的Excel文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="experiment-name">实验名称 *</Label>
              <Input
                id="experiment-name"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                placeholder="例如：光伏关断器测试-001"
                className="bg-industrial-bg border-industrial-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device-address">设备地址</Label>
                <Input
                  id="device-address"
                  value={deviceAddress}
                  onChange={(e) => setDeviceAddress(e.target.value)}
                  placeholder="例如：1"
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-type">设备类型</Label>
                <Input
                  id="device-type"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  placeholder="例如：光伏关断器-A型"
                  className="bg-industrial-bg border-industrial-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">选择文件</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={handleFileSelect}
                  className="bg-industrial-bg border-industrial-primary/30"
                />
                <FileSpreadsheet className="h-5 w-5 text-industrial-primary" />
              </div>
              {selectedFiles && (
                <p className="text-sm text-gray-400">
                  已选择 {selectedFiles.length} 个文件
                </p>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">上传进度</span>
                  <span className="text-industrial-primary">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFiles}
              className="w-full bg-industrial-primary text-black hover:bg-industrial-primary/80"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  开始上传
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 上传结果 */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="text-industrial-success">上传结果</CardTitle>
            <CardDescription className="text-gray-400">
              查看文件上传状态和数据导入情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadResults.length > 0 ? (
              <div className="space-y-3">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-industrial-bg"
                  >
                    <div className="flex items-center space-x-3">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-industrial-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-industrial-danger" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{result.fileName}</p>
                        <p className="text-xs text-gray-400">{result.message}</p>
                      </div>
                    </div>
                    {result.dataCount && (
                      <span className="text-sm text-industrial-primary">
                        {result.dataCount} 条数据
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无上传记录</p>
                <p className="text-sm mt-2">选择文件并点击上传开始导入数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 文件格式说明 */}
      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-industrial-warning">文件格式说明</CardTitle>
            <Button
              onClick={() => generateExcelTemplate()}
              variant="outline"
              size="sm"
              className="border-industrial-primary/30 text-industrial-primary hover:bg-industrial-primary/10"
            >
              <Download className="mr-2 h-4 w-4" />
              下载模板
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-400">
            <p>支持的文件格式：.xlsx, .xls, .csv</p>
            <p>Excel文件应包含以下列（列名需完全匹配）：</p>
            <div className="bg-industrial-bg rounded-lg p-4 font-mono text-xs">
              <table className="w-full">
                <thead>
                  <tr className="text-industrial-primary">
                    <th className="text-left p-2">序号</th>
                    <th className="text-left p-2">电流 (A)</th>
                    <th className="text-left p-2">电压 (V)</th>
                    <th className="text-left p-2">功率 (W)</th>
                    <th className="text-left p-2">时间戳</th>
                    <th className="text-left p-2">设备地址</th>
                    <th className="text-left p-2">设备类型</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">1</td>
                    <td className="p-2">0.11</td>
                    <td className="p-2">20.355</td>
                    <td className="p-2">2.239</td>
                    <td className="p-2">2025/5/2</td>
                    <td className="p-2">1</td>
                    <td className="p-2">未知</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-industrial-warning">
              注意：功率会根据电压和电流自动计算，即使Excel中有功率数据也会被重新计算
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}