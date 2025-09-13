import { describe, it, expect, beforeEach } from '@jest/globals'
import { formatDate, formatNumber } from '@/lib/utils'

describe('报告生成测试', () => {
  const mockExperiment = {
    id: 'test-exp-id',
    experiment_name: '测试实验001',
    operator_name: '张三',
    device_type: '光伏关断器-A型',
    device_address: '1',
    created_at: '2025-01-14T10:00:00Z',
    status: 'completed' as const,
    description: '测试实验描述',
    operator_id: 'user-id',
    updated_at: '2025-01-14T10:00:00Z'
  }

  const mockData = [
    {
      id: '1',
      experiment_id: 'test-exp-id',
      sequence_number: 1,
      timestamp: '2025-01-14T10:00:00Z',
      voltage: 20.355,
      current: 0.11,
      power: 2.239,
      resistance: 185.05,
      created_at: '2025-01-14T10:00:00Z'
    },
    {
      id: '2',
      experiment_id: 'test-exp-id',
      sequence_number: 2,
      timestamp: '2025-01-14T10:01:00Z',
      voltage: 20.681,
      current: 0.26,
      power: 5.377,
      resistance: 79.54,
      created_at: '2025-01-14T10:01:00Z'
    }
  ]

  describe('PDF报告生成', () => {
    it('应该包含实验基本信息', () => {
      const reportInfo = {
        title: '实验数据分析报告',
        experimentName: mockExperiment.experiment_name,
        operator: mockExperiment.operator_name,
        deviceType: mockExperiment.device_type,
        deviceAddress: mockExperiment.device_address,
        date: formatDate(mockExperiment.created_at),
        dataCount: mockData.length
      }

      expect(reportInfo.experimentName).toBe('测试实验001')
      expect(reportInfo.operator).toBe('张三')
      expect(reportInfo.dataCount).toBe(2)
    })

    it('应该计算统计数据', () => {
      const voltages = mockData.map(d => d.voltage)
      const currents = mockData.map(d => d.current)
      const powers = mockData.map(d => d.power)

      const stats = {
        voltage: {
          avg: voltages.reduce((a, b) => a + b, 0) / voltages.length,
          max: Math.max(...voltages),
          min: Math.min(...voltages)
        },
        current: {
          avg: currents.reduce((a, b) => a + b, 0) / currents.length,
          max: Math.max(...currents),
          min: Math.min(...currents)
        },
        power: {
          avg: powers.reduce((a, b) => a + b, 0) / powers.length,
          max: Math.max(...powers),
          min: Math.min(...powers)
        }
      }

      expect(stats.voltage.avg).toBeCloseTo(20.518, 3)
      expect(stats.voltage.max).toBe(20.681)
      expect(stats.voltage.min).toBe(20.355)

      expect(stats.current.avg).toBeCloseTo(0.185, 3)
      expect(stats.current.max).toBe(0.26)
      expect(stats.current.min).toBe(0.11)

      expect(stats.power.avg).toBeCloseTo(3.808, 3)
      expect(stats.power.max).toBe(5.377)
      expect(stats.power.min).toBe(2.239)
    })

    it('应该识别异常数据', () => {
      const thresholds = {
        voltage: 30,
        current: 2,
        power: 50
      }

      const anomalousData = [
        { voltage: 35.5, current: 0.5, power: 17.75 },
        { voltage: 25.0, current: 2.5, power: 62.5 }
      ]

      const anomalies = []
      
      anomalousData.forEach(data => {
        if (data.voltage > thresholds.voltage) {
          anomalies.push(`高电压: ${data.voltage}V`)
        }
        if (data.current > thresholds.current) {
          anomalies.push(`高电流: ${data.current}A`)
        }
        if (data.power > thresholds.power) {
          anomalies.push(`高功率: ${data.power}W`)
        }
      })

      expect(anomalies).toContain('高电压: 35.5V')
      expect(anomalies).toContain('高电流: 2.5A')
      expect(anomalies).toContain('高功率: 62.5W')
    })

    it('应该生成结论和建议', () => {
      const generateConclusions = (dataCount: number, avgPower: number) => {
        const conclusions = []
        
        conclusions.push(`实验共采集 ${dataCount} 个数据点，数据完整性良好。`)
        
        if (avgPower < 10) {
          conclusions.push('功率输出稳定，处于低功率运行状态。')
        } else if (avgPower < 50) {
          conclusions.push('功率输出稳定，处于正常功率范围。')
        } else {
          conclusions.push('功率输出较高，建议监控设备温度。')
        }
        
        conclusions.push('建议继续监控设备运行状态，确保长期稳定性。')
        
        return conclusions
      }

      const conclusions = generateConclusions(mockData.length, 3.808)
      
      expect(conclusions).toHaveLength(3)
      expect(conclusions[0]).toContain('2 个数据点')
      expect(conclusions[1]).toContain('低功率运行状态')
    })
  })

  describe('Excel报告生成', () => {
    it('应该生成正确的CSV格式', () => {
      const csvHeaders = ['序号', '时间戳', '电压(V)', '电流(A)', '功率(W)', '阻值(Ω)']
      const csvData = mockData.map(row => [
        row.sequence_number,
        row.timestamp,
        row.voltage,
        row.current,
        row.power,
        row.resistance || ''
      ])

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.join(','))
        .join('\n')

      expect(csvContent).toContain('序号,时间戳,电压(V)')
      expect(csvContent).toContain('1,2025-01-14T10:00:00Z,20.355')
      expect(csvContent).toContain('2,2025-01-14T10:01:00Z,20.681')
    })

    it('应该包含报告头部信息', () => {
      const reportHeader = [
        ['实验报告'],
        [''],
        ['实验名称:', mockExperiment.experiment_name],
        ['操作员:', mockExperiment.operator_name],
        ['设备类型:', mockExperiment.device_type],
        ['设备地址:', mockExperiment.device_address],
        ['创建时间:', formatDate(mockExperiment.created_at)]
      ]

      const headerContent = reportHeader.map(row => row.join(',')).join('\n')
      
      expect(headerContent).toContain('实验报告')
      expect(headerContent).toContain(`实验名称:,${mockExperiment.experiment_name}`)
      expect(headerContent).toContain(`操作员:,${mockExperiment.operator_name}`)
    })

    it('应该处理空值和特殊字符', () => {
      const dataWithSpecialCases = {
        sequence_number: 1,
        timestamp: '2025-01-14T10:00:00Z',
        voltage: 20.355,
        current: 0.11,
        power: 2.239,
        resistance: null,
        temperature: undefined,
        notes: '包含,逗号的"文本"'
      }

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      expect(escapeCSV(dataWithSpecialCases.resistance)).toBe('')
      expect(escapeCSV(dataWithSpecialCases.temperature)).toBe('')
      expect(escapeCSV(dataWithSpecialCases.notes)).toBe('"包含,逗号的""文本"""')
    })
  })

  describe('报告文件下载', () => {
    it('应该生成正确的文件名', () => {
      const generateFileName = (experimentName: string, format: 'pdf' | 'csv') => {
        const date = new Date().toISOString().split('T')[0]
        const sanitizedName = experimentName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
        return `${sanitizedName}_报告_${date}.${format}`
      }

      const pdfFileName = generateFileName(mockExperiment.experiment_name, 'pdf')
      const csvFileName = generateFileName(mockExperiment.experiment_name, 'csv')

      expect(pdfFileName).toMatch(/测试实验001_报告_\d{4}-\d{2}-\d{2}\.pdf/)
      expect(csvFileName).toMatch(/测试实验001_报告_\d{4}-\d{2}-\d{2}\.csv/)
    })

    it('应该设置正确的MIME类型', () => {
      const mimeTypes = {
        pdf: 'application/pdf',
        csv: 'text/csv;charset=utf-8;',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }

      expect(mimeTypes.pdf).toBe('application/pdf')
      expect(mimeTypes.csv).toContain('text/csv')
      expect(mimeTypes.csv).toContain('charset=utf-8')
    })
  })
})