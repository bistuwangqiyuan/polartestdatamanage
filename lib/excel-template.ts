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

      '时间戳': '2025/1/14',

      '设备地址': '1',
      '设备类型': '光伏关断器-A型'
    },
    {
      '序号': 2,
      '电流 (A)': 0.26,
      '电压 (V)': 20.681,
      '功率 (W)': 5.377,

      '时间戳': '2025/1/15 10:01:00',

      '时间戳': '2025/1/14',

      '设备地址': '1',
      '设备类型': '光伏关断器-A型'
    },
    {
      '序号': 3,

      '电流 (A)': 0.52,
      '电压 (V)': 21.054,
      '功率 (W)': 10.948,
      '时间戳': '2025/1/15 10:02:00',

      '电流 (A)': 0.32,
      '电压 (V)': 21.002,
      '功率 (W)': 6.721,
      '时间戳': '2025/1/14',

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

  const colWidths = [
    { wch: 8 },   // 序号
    { wch: 12 },  // 电流 (A)
    { wch: 12 },  // 电压 (V)
    { wch: 12 },  // 功率 (W)
    { wch: 15 },  // 时间戳
    { wch: 12 },  // 设备地址
    { wch: 20 }   // 设备类型
  ]
  ws['!cols'] = colWidths

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '实验数据')
  
  // 添加说明工作表
  const instructionData = [
    { '说明': '数据格式要求' },
    { '说明': '1. 列名必须完全匹配，包括空格和括号' },
    { '说明': '2. 序号：整数，数据的顺序编号' },
    { '说明': '3. 电流 (A)：小数，单位为安培' },
    { '说明': '4. 电压 (V)：小数，单位为伏特' },
    { '说明': '5. 功率 (W)：小数，单位为瓦特（会自动重新计算）' },
    { '说明': '6. 时间戳：日期时间格式，例如 2025/1/14 或 2025-01-14 10:30:00' },
    { '说明': '7. 设备地址：字符串，设备的标识地址' },
    { '说明': '8. 设备类型：字符串，设备的型号或类型' },
    { '说明': '' },
    { '说明': '注意事项：' },
    { '说明': '- 功率会根据电压和电流自动计算，即使Excel中有功率数据也会被重新计算' },
    { '说明': '- 确保数据中没有空行' },
    { '说明': '- 数值数据不要包含单位，单位已在列名中指定' },
    { '说明': '- 支持批量上传多个文件' }
  ]
  
  const wsInstructions = XLSX.utils.json_to_sheet(instructionData)
  wsInstructions['!cols'] = [{ wch: 80 }]
  
  XLSX.utils.book_append_sheet(wb, wsInstructions, '使用说明')
  
  // 生成文件并下载
  const fileName = `实验数据模板_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
}

export function parseExcelDate(excelDate: any): Date {
  if (excelDate instanceof Date) {
    return excelDate
  }
  
  if (typeof excelDate === 'number') {
    // Excel序列号转换为日期
    return new Date((excelDate - 25569) * 86400 * 1000)
  }
  
  if (typeof excelDate === 'string') {
    // 尝试解析字符串日期
    const date = new Date(excelDate)
    if (isNaN(date.getTime())) {
      // 如果解析失败，返回当前时间
      return new Date()
    }
    return date
  }
  
  return new Date()

}