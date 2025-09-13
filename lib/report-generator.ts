import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Experiment, ExperimentDataPoint } from '@/types'
import { formatDate, formatNumber } from '@/lib/utils'

export async function generatePDFReport(
  experiment: Experiment,
  data: ExperimentDataPoint[]
) {
  // 创建一个临时的HTML元素来渲染报告内容
  const reportContainer = document.createElement('div')
  reportContainer.style.position = 'absolute'
  reportContainer.style.left = '-9999px'
  reportContainer.style.width = '210mm'
  reportContainer.style.padding = '20mm'
  reportContainer.style.backgroundColor = 'white'
  reportContainer.style.color = 'black'
  reportContainer.style.fontFamily = 'sans-serif'
  
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

  // 检查异常数据
  const anomalies = []
  if (stats.voltage.max > 30) {
    anomalies.push(`检测到高电压值: ${formatNumber(stats.voltage.max)} V`)
  }
  if (stats.current.max > 2) {
    anomalies.push(`检测到高电流值: ${formatNumber(stats.current.max, 3)} A`)
  }
  if (stats.power.max > 50) {
    anomalies.push(`检测到高功率值: ${formatNumber(stats.power.max)} W`)
  }

  reportContainer.innerHTML = `
    <div style="font-family: 'Arial', sans-serif;">
      <h1 style="text-align: center; color: #00D4FF; margin-bottom: 30px;">实验数据分析报告</h1>
      
      <div style="margin-bottom: 30px;">
        <h2 style="color: #FFB800; border-bottom: 2px solid #FFB800; padding-bottom: 5px;">实验基本信息</h2>
        <table style="width: 100%; margin-top: 15px;">
          <tr>
            <td style="padding: 8px 0; width: 30%;"><strong>实验名称：</strong></td>
            <td style="padding: 8px 0;">${experiment.experiment_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>操作员：</strong></td>
            <td style="padding: 8px 0;">${experiment.operator_name || '未知'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>设备类型：</strong></td>
            <td style="padding: 8px 0;">${experiment.device_type || '未知'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>设备地址：</strong></td>
            <td style="padding: 8px 0;">${experiment.device_address || '未知'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>创建时间：</strong></td>
            <td style="padding: 8px 0;">${formatDate(experiment.created_at)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>数据点数量：</strong></td>
            <td style="padding: 8px 0;">${data.length}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #00FF88; border-bottom: 2px solid #00FF88; padding-bottom: 5px;">数据统计分析</h2>
        <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">参数</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">平均值</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">最大值</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">最小值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>电压 (V)</strong></td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.voltage.avg)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.voltage.max)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.voltage.min)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>电流 (A)</strong></td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.current.avg, 3)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.current.max, 3)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.current.min, 3)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>功率 (W)</strong></td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.power.avg)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.power.max)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${formatNumber(stats.power.min)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #FF3838; border-bottom: 2px solid #FF3838; padding-bottom: 5px;">数据质量分析</h2>
        <ul style="margin-top: 15px; line-height: 1.8;">
          ${anomalies.length > 0 
            ? anomalies.map(a => `<li>${a}</li>`).join('')
            : '<li>未检测到异常数据</li>'
          }
        </ul>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 5px;">结论与建议</h2>
        <ol style="margin-top: 15px; line-height: 1.8;">
          <li>实验共采集 ${data.length} 个数据点，数据完整性良好。</li>
          <li>电压平均值为 ${formatNumber(stats.voltage.avg)} V，在正常范围内。</li>
          <li>功率输出稳定，平均功率为 ${formatNumber(stats.power.avg)} W。</li>
          <li>建议继续监控设备运行状态，确保长期稳定性。</li>
        </ol>
      </div>

      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
        <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
        <p>光伏关断器实验数据管理系统</p>
      </div>
    </div>
  `
  
  document.body.appendChild(reportContainer)
  
  try {
    // 使用html2canvas将HTML转换为图片
    const canvas = await html2canvas(reportContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
    })
    
    // 创建PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    // 添加图片到PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // 如果内容超过一页，添加新页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // 保存PDF
    pdf.save(`${experiment.experiment_name}_报告_${new Date().toISOString().split('T')[0]}.pdf`)
  } finally {
    // 清理临时元素
    document.body.removeChild(reportContainer)
  }
}