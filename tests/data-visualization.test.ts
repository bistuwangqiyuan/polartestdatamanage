import { describe, it, expect } from '@jest/globals'
import { calculateStats, formatNumber } from '@/lib/utils'

describe('数据可视化测试', () => {
  describe('数据统计计算', () => {
    it('应该正确计算平均值、最大值和最小值', () => {
      const testData = [10, 20, 30, 40, 50]
      const stats = calculateStats(testData)

      expect(stats.avg).toBe(30)
      expect(stats.max).toBe(50)
      expect(stats.min).toBe(10)
    })

    it('应该处理空数组', () => {
      const emptyData: number[] = []
      const stats = calculateStats(emptyData)

      expect(stats.avg).toBe(0)
      expect(stats.max).toBe(0)
      expect(stats.min).toBe(0)
    })

    it('应该处理单个值的数组', () => {
      const singleValue = [42]
      const stats = calculateStats(singleValue)

      expect(stats.avg).toBe(42)
      expect(stats.max).toBe(42)
      expect(stats.min).toBe(42)
    })

    it('应该处理负数值', () => {
      const negativeData = [-10, -5, 0, 5, 10]
      const stats = calculateStats(negativeData)

      expect(stats.avg).toBe(0)
      expect(stats.max).toBe(10)
      expect(stats.min).toBe(-10)
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化数字', () => {
      expect(formatNumber(123.456)).toBe('123.46')
      expect(formatNumber(123.456, 3)).toBe('123.456')
      expect(formatNumber(0.12345, 4)).toBe('0.1235')
      expect(formatNumber(100)).toBe('100.00')
    })

    it('应该处理特殊值', () => {
      expect(formatNumber(0)).toBe('0.00')
      expect(formatNumber(-123.456)).toBe('-123.46')
      expect(formatNumber(0.001, 3)).toBe('0.001')
    })
  })

  describe('图表数据准备', () => {
    it('应该正确准备折线图数据', () => {
      const rawData = [
        { sequence_number: 1, voltage: 20.1, current: 0.11, power: 2.211 },
        { sequence_number: 2, voltage: 20.5, current: 0.25, power: 5.125 },
        { sequence_number: 3, voltage: 21.0, current: 0.30, power: 6.300 }
      ]

      const chartData = {
        labels: rawData.map(d => d.sequence_number.toString()),
        datasets: [
          {
            label: '电压 (V)',
            data: rawData.map(d => d.voltage)
          },
          {
            label: '电流 (A)',
            data: rawData.map(d => d.current)
          },
          {
            label: '功率 (W)',
            data: rawData.map(d => d.power)
          }
        ]
      }

      expect(chartData.labels).toEqual(['1', '2', '3'])
      expect(chartData.datasets[0].data).toEqual([20.1, 20.5, 21.0])
      expect(chartData.datasets[1].data).toEqual([0.11, 0.25, 0.30])
      expect(chartData.datasets[2].data).toEqual([2.211, 5.125, 6.300])
    })

    it('应该计算功率分布', () => {
      const powerData = [1.5, 2.8, 3.2, 5.5, 7.8, 9.2, 11.5]
      
      const distribution = {
        '0-2W': 0,
        '2-4W': 0,
        '4-6W': 0,
        '6-8W': 0,
        '8-10W': 0,
        '>10W': 0
      }

      powerData.forEach(power => {
        if (power >= 0 && power < 2) distribution['0-2W']++
        else if (power >= 2 && power < 4) distribution['2-4W']++
        else if (power >= 4 && power < 6) distribution['4-6W']++
        else if (power >= 6 && power < 8) distribution['6-8W']++
        else if (power >= 8 && power < 10) distribution['8-10W']++
        else if (power >= 10) distribution['>10W']++
      })

      expect(distribution['0-2W']).toBe(1)
      expect(distribution['2-4W']).toBe(2)
      expect(distribution['4-6W']).toBe(1)
      expect(distribution['6-8W']).toBe(1)
      expect(distribution['8-10W']).toBe(1)
      expect(distribution['>10W']).toBe(1)
    })
  })

  describe('实时数据更新', () => {
    it('应该限制显示的数据点数量', () => {
      const allData = Array(100).fill(null).map((_, i) => ({
        id: i,
        value: Math.random() * 100
      }))

      const maxDisplayPoints = 50
      const displayData = allData.slice(-maxDisplayPoints)

      expect(displayData).toHaveLength(50)
      expect(displayData[0].id).toBe(50)
      expect(displayData[49].id).toBe(99)
    })

    it('应该保持数据的时间顺序', () => {
      const timestamps = [
        '2025-01-14T10:00:00Z',
        '2025-01-14T10:01:00Z',
        '2025-01-14T10:02:00Z',
        '2025-01-14T10:03:00Z'
      ]

      const sortedTimestamps = [...timestamps].sort()
      expect(timestamps).toEqual(sortedTimestamps)
    })
  })

  describe('异常数据检测', () => {
    it('应该检测超出阈值的电压', () => {
      const voltageThreshold = 30
      const testVoltages = [20.5, 25.3, 31.2, 28.9, 35.5]
      
      const anomalies = testVoltages.filter(v => v > voltageThreshold)
      expect(anomalies).toEqual([31.2, 35.5])
    })

    it('应该检测超出阈值的电流', () => {
      const currentThreshold = 2.0
      const testCurrents = [0.5, 1.2, 2.5, 0.8, 3.1]
      
      const anomalies = testCurrents.filter(c => c > currentThreshold)
      expect(anomalies).toEqual([2.5, 3.1])
    })

    it('应该生成异常警报信息', () => {
      const createAlert = (type: string, threshold: number, actual: number) => ({
        alert_type: type,
        severity: actual > threshold * 1.5 ? 'critical' : 'high',
        message: `${type}超出阈值`,
        threshold_value: threshold,
        actual_value: actual
      })

      const alert = createAlert('voltage_high', 30, 45)
      
      expect(alert.severity).toBe('critical')
      expect(alert.threshold_value).toBe(30)
      expect(alert.actual_value).toBe(45)
    })
  })
})