import * as XLSX from 'xlsx'

export function generateExcelTemplate() {
  // 创建示例数据
  const templateData = [
    {
      '序号': 1,
      '电流 (A)': 0.11,
      '电压 (V)': 20.355,
      '功率 (W)': 2.239,
      '时间戳': '2025/1/15 10:00:00',
      '设备地址': '1',
      '设备类型': '光伏关断器-A型'
    },
    {
      '序号': 2,
      '电流 (A)': 0.26,
      '电压 (V)': 20.681,
      '功率 (W)': 5.377,
      '时间戳': '2025/1/15 10:01:00',
      '设备地址': '1',
      '设备类型': '光伏关断器-A型'
    },
    {
      '序号': 3,
      '电流 (A)': 0.52,
      '电压 (V)': 21.054,
      '功率 (W)': 10.948,
      '时间戳': '2025/1/15 10:02:00',
      '设备地址': '1',
      '设备类型': '光伏关断器-A型'
    }
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  
  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(templateData)
  
  // 设置列宽
  const columnWidths = [
    { wch: 8 },  // 序号
    { wch: 12 }, // 电流 (A)
    { wch: 12 }, // 电压 (V)
    { wch: 12 }, // 功率 (W)
    { wch: 20 }, // 时间戳
    { wch: 12 }, // 设备地址
    { wch: 20 }, // 设备类型
  ]
  ws['!cols'] = columnWidths

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '实验数据模板')

  // 生成二进制数据
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  
  // 创建Blob对象
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  // 创建下载链接
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '光伏关断器实验数据模板.xlsx'
  link.click()
  
  // 清理URL对象
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
