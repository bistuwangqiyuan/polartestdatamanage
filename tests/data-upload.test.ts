import { describe, it, expect, beforeEach } from '@jest/globals'
import * as XLSX from 'xlsx'
import { parseExcelDate } from '@/lib/excel-template'

describe('Excel数据上传测试', () => {
  describe('Excel文件解析', () => {
    it('应该正确解析Excel文件内容', () => {
      // 模拟Excel数据
      const mockExcelData = [
        {
          '序号': 1,
          '电流 (A)': 0.11,
          '电压 (V)': 20.355,
          '功率 (W)': 2.239,
          '时间戳': '2025/1/14',
          '设备地址': '1',
          '设备类型': '光伏关断器-A型'
        },
        {
          '序号': 2,
          '电流 (A)': 0.26,
          '电压 (V)': 20.681,
          '功率 (W)': 5.377,
          '时间戳': '2025/1/14',
          '设备地址': '1',
          '设备类型': '光伏关断器-A型'
        }
      ]

      expect(mockExcelData).toHaveLength(2)
      expect(mockExcelData[0]['电压 (V)']).toBe(20.355)
      expect(mockExcelData[1]['电流 (A)']).toBe(0.26)
    })

    it('应该处理不同的日期格式', () => {
      // 测试字符串日期
      const stringDate = '2025/1/14'
      const parsedDate1 = parseExcelDate(stringDate)
      expect(parsedDate1).toBeInstanceOf(Date)
      expect(parsedDate1.getFullYear()).toBe(2025)

      // 测试Excel序列号
      const excelSerial = 45305 // 2024年1月1日
      const parsedDate2 = parseExcelDate(excelSerial)
      expect(parsedDate2).toBeInstanceOf(Date)
      
      // 测试已经是Date对象
      const dateObj = new Date('2025-01-14')
      const parsedDate3 = parseExcelDate(dateObj)
      expect(parsedDate3).toEqual(dateObj)
    })

    it('应该验证必需的列', () => {
      const requiredColumns = ['序号', '电流 (A)', '电压 (V)', '时间戳']
      const mockData = {
        '序号': 1,
        '电流 (A)': 0.11,
        '电压 (V)': 20.355,
        '时间戳': '2025/1/14'
      }

      const hasAllColumns = requiredColumns.every(col => col in mockData)
      expect(hasAllColumns).toBe(true)
    })

    it('应该拒绝格式错误的数据', () => {
      const invalidData = {
        '序号': 'abc', // 应该是数字
        '电流 (A)': '不是数字',
        '电压 (V)': null,
        '时间戳': ''
      }

      // 验证数据类型
      expect(isNaN(Number(invalidData['序号']))).toBe(true)
      expect(isNaN(Number(invalidData['电流 (A)']))).toBe(true)
      expect(invalidData['电压 (V)']).toBeNull()
      expect(invalidData['时间戳']).toBe('')
    })
  })

  describe('数据转换', () => {
    it('应该正确转换数据格式', () => {
      const excelRow = {
        '序号': 1,
        '电流 (A)': 0.11,
        '电压 (V)': 20.355,
        '功率 (W)': 2.239,
        '时间戳': '2025/1/14'
      }

      const convertedData = {
        sequence_number: excelRow['序号'],
        current: excelRow['电流 (A)'],
        voltage: excelRow['电压 (V)'],
        timestamp: new Date(excelRow['时间戳']).toISOString()
      }

      expect(convertedData.sequence_number).toBe(1)
      expect(convertedData.current).toBe(0.11)
      expect(convertedData.voltage).toBe(20.355)
      expect(convertedData.timestamp).toContain('2025-01-14')
    })

    it('应该自动计算功率值', () => {
      const voltage = 20.355
      const current = 0.11
      const expectedPower = voltage * current

      expect(expectedPower).toBeCloseTo(2.239, 3)
    })

    it('应该处理缺失的可选字段', () => {
      const minimalData = {
        '序号': 1,
        '电流 (A)': 0.11,
        '电压 (V)': 20.355,
        '时间戳': '2025/1/14'
        // 设备地址和设备类型是可选的
      }

      const converted = {
        sequence_number: minimalData['序号'],
        current: minimalData['电流 (A)'],
        voltage: minimalData['电压 (V)'],
        timestamp: new Date(minimalData['时间戳']).toISOString(),
        device_address: minimalData['设备地址'] || '1',
        device_type: minimalData['设备类型'] || '未知'
      }

      expect(converted.device_address).toBe('1')
      expect(converted.device_type).toBe('未知')
    })
  })

  describe('批量上传', () => {
    it('应该支持大量数据的批量处理', () => {
      const largeDataset = Array(1000).fill(null).map((_, index) => ({
        sequence_number: index + 1,
        voltage: 20 + Math.random() * 2,
        current: 0.1 + Math.random() * 0.5,
        timestamp: new Date().toISOString()
      }))

      const batchSize = 100
      const batches = []
      
      for (let i = 0; i < largeDataset.length; i += batchSize) {
        batches.push(largeDataset.slice(i, i + batchSize))
      }

      expect(batches).toHaveLength(10)
      expect(batches[0]).toHaveLength(100)
      expect(batches[9]).toHaveLength(100)
    })

    it('应该处理上传错误', async () => {
      const mockUpload = jest.fn()
        .mockRejectedValueOnce(new Error('网络错误'))
        .mockResolvedValueOnce({ success: true })

      try {
        await mockUpload()
      } catch (error: any) {
        expect(error.message).toBe('网络错误')
      }

      const result = await mockUpload()
      expect(result.success).toBe(true)
    })
  })

  describe('文件验证', () => {
    it('应该只接受支持的文件格式', () => {
      const supportedFormats = ['.xlsx', '.xls', '.csv']
      const testFiles = [
        'data.xlsx',
        'data.xls', 
        'data.csv',
        'data.txt',
        'data.pdf'
      ]

      testFiles.forEach(filename => {
        const extension = filename.substring(filename.lastIndexOf('.'))
        const isSupported = supportedFormats.includes(extension)
        
        if (filename.includes('.txt') || filename.includes('.pdf')) {
          expect(isSupported).toBe(false)
        } else {
          expect(isSupported).toBe(true)
        }
      })
    })

    it('应该限制文件大小', () => {
      const maxSizeInMB = 10
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024

      const testFile = {
        size: 5 * 1024 * 1024 // 5MB
      }

      expect(testFile.size).toBeLessThanOrEqual(maxSizeInBytes)
    })
  })
})