import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNumber(num: number, decimals: number = 2) {
  return num.toFixed(decimals)
}

export function calculateStats(data: number[]) {
  if (data.length === 0) return { min: 0, max: 0, avg: 0 }
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const avg = data.reduce((a, b) => a + b, 0) / data.length
  
  return { min, max, avg }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'text-industrial-success'
    case 'warning':
      return 'text-industrial-warning'
    case 'error':
      return 'text-industrial-danger'
    default:
      return 'text-gray-400'
  }
}

export function parseExcelDate(serial: number) {
  const utc_days = Math.floor(serial - 25569)
  const utc_value = utc_days * 86400
  const date_info = new Date(utc_value * 1000)
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate())
}