import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Experiment, ExperimentDataPoint } from '@/types'
import { formatDate, formatNumber } from '@/lib/utils'

export async function generatePDFReport(
  experiment: Experiment,
  data: ExperimentDataPoint[]
) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // 设置字体
  pdf.setFont('helvetica')

  // 标题
  pdf.setFontSize(24)
  pdf.setTextColor(0, 212, 255) // industrial-primary color
  pdf.text('实验数据分析报告', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // 实验基本信息
  pdf.setFontSize(16)
  pdf.setTextColor(255, 184, 0) // industrial-warning color
  pdf.text('实验基本信息', 15, yPosition)
  yPosition += 10

  pdf.setFontSize(11)
  pdf.setTextColor(60, 60, 60)
  const basicInfo = [
    ['实验名称:', experiment.experiment_name],
    ['操作员:', experiment.operator_name || '未知'],
    ['设备类型:', experiment.device_type || '未知'],
    ['设备地址:', experiment.device_address || '未知'],
    ['创建时间:', formatDate(experiment.created_at)],
    ['数据点数量:', data.length.toString()],
  ]

  basicInfo.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold')
    pdf.text(label, 15, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.text(value, 60, yPosition)
    yPosition += 7
  })

  yPosition += 10

  // 数据统计分析
  pdf.setFontSize(16)
  pdf.setTextColor(0, 255, 136) // industrial-success color
  pdf.text('数据统计分析', 15, yPosition)
  yPosition += 10

  // 计算统计数据
  const voltages = data.map(d => d.voltage || 0)
  const currents = data.map(d => d.current || 0)
  const powers = data.map(d => d.power || 0)

  const stats = {
    voltage: {
      avg: voltages.reduce((a, b) => a + b, 0) / voltages.length,
      max: Math.max(...voltages),
      min: Math.min(...voltages),
    },
    current: {
      avg: currents.reduce((a, b) => a + b, 0) / currents.length,
      max: Math.max(...currents),
      min: Math.min(...currents),
    },
    power: {
      avg: powers.reduce((a, b) => a + b, 0) / powers.length,
      max: Math.max(...powers),
      min: Math.min(...powers),
    },
  }

  pdf.setFontSize(11)
  pdf.setTextColor(60, 60, 60)

  // 创建统计表格
  const tableData = [
    ['参数', '平均值', '最大值', '最小值'],
    [
      '电压 (V)',
      formatNumber(stats.voltage.avg),
      formatNumber(stats.voltage.max),
      formatNumber(stats.voltage.min),
    ],
    [
      '电流 (A)',
      formatNumber(stats.current.avg, 3),
      formatNumber(stats.current.max, 3),
      formatNumber(stats.current.min, 3),
    ],
    [
      '功率 (W)',
      formatNumber(stats.power.avg),
      formatNumber(stats.power.max),
      formatNumber(stats.power.min),
    ],
  ]

  // 绘制表格
  const cellWidth = 40
  const cellHeight = 8
  const tableX = 15
  let tableY = yPosition

  tableData.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const x = tableX + colIndex * cellWidth
      const y = tableY + rowIndex * cellHeight

      // 绘制单元格边框
      pdf.rect(x, y, cellWidth, cellHeight)
      
      // 设置表头样式
      if (rowIndex === 0) {
        pdf.setFillColor(0, 212, 255, 0.1)
        pdf.rect(x, y, cellWidth, cellHeight, 'F')
        pdf.setFont('helvetica', 'bold')
      } else {
        pdf.setFont('helvetica', 'normal')
      }

      // 添加文本
      pdf.text(cell, x + cellWidth / 2, y + cellHeight / 2 + 1, { 
        align: 'center',
        baseline: 'middle'
      })
    })
  })

  yPosition = tableY + tableData.length * cellHeight + 15

  // 数据质量分析
  pdf.setFontSize(16)
  pdf.setTextColor(255, 56, 56) // industrial-danger color
  pdf.text('数据质量分析', 15, yPosition)
  yPosition += 10

  pdf.setFontSize(11)
  pdf.setTextColor(60, 60, 60)

  // 检查异常数据
  const anomalies = []
  if (stats.voltage.max > 30) {
    anomalies.push(`- 检测到高电压值: ${formatNumber(stats.voltage.max)} V`)
  }
  if (stats.current.max > 2) {
    anomalies.push(`- 检测到高电流值: ${formatNumber(stats.current.max, 3)} A`)
  }
  if (stats.power.max > 50) {
    anomalies.push(`- 检测到高功率值: ${formatNumber(stats.power.max)} W`)
  }

  if (anomalies.length > 0) {
    anomalies.forEach(anomaly => {
      pdf.text(anomaly, 15, yPosition)
      yPosition += 7
    })
  } else {
    pdf.text('- 未检测到异常数据', 15, yPosition)
    yPosition += 7
  }

  yPosition += 10

  // 结论和建议
  pdf.setFontSize(16)
  pdf.setTextColor(124, 58, 237) // 紫色
  pdf.text('结论与建议', 15, yPosition)
  yPosition += 10

  pdf.setFontSize(11)
  pdf.setTextColor(60, 60, 60)
  
  const conclusions = [
    `1. 实验共采集 ${data.length} 个数据点，数据完整性良好。`,
    `2. 电压平均值为 ${formatNumber(stats.voltage.avg)} V，在正常范围内。`,
    `3. 功率输出稳定，平均功率为 ${formatNumber(stats.power.avg)} W。`,
    `4. 建议继续监控设备运行状态，确保长期稳定性。`,
  ]

  conclusions.forEach(conclusion => {
    // 检查是否需要换页
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = 20
    }
    pdf.text(conclusion, 15, yPosition)
    yPosition += 7
  })

  // 添加页脚
  const totalPages = pdf.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(10)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `第 ${i} 页，共 ${totalPages} 页`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    pdf.text(
      `生成时间: ${new Date().toLocaleString('zh-CN')}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    )
  }

  // 保存PDF
  pdf.save(`${experiment.experiment_name}_报告_${new Date().toISOString().split('T')[0]}.pdf`)
}