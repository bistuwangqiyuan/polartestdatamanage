'use client'

import { useEffect, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { useSupabase } from '@/components/providers/supabase-provider'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ChartProps {
  type: 'voltage-current' | 'power-distribution'
}

export default function OverviewChart({ type }: ChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchChartData()
  }, [type])

  const fetchChartData = async () => {
    try {
      // 获取最近的实验数据
      const { data, error } = await supabase
        .from('experiment_data')
        .select('timestamp, voltage, current, power')
        .order('timestamp', { ascending: true })
        .limit(20)

      if (error) throw error

      if (type === 'voltage-current') {
        setChartData({
          labels: data.map(d => new Date(d.timestamp).toLocaleTimeString('zh-CN')),
          datasets: [
            {
              label: '电压 (V)',
              data: data.map(d => d.voltage),
              borderColor: '#00D4FF',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              tension: 0.4,
            },
            {
              label: '电流 (A)',
              data: data.map(d => d.current),
              borderColor: '#00FF88',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
            },
          ],
        })
      } else {
        setChartData({
          labels: data.map(d => new Date(d.timestamp).toLocaleTimeString('zh-CN')),
          datasets: [
            {
              label: '功率 (W)',
              data: data.map(d => d.power),
              backgroundColor: '#FFB800',
              borderColor: '#FFB800',
              borderWidth: 2,
            },
          ],
        })
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 58, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00D4FF',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#999',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#999',
        },
      },
      ...(type === 'voltage-current' && {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#999',
          },
        },
      }),
    },
  }

  if (!chartData) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      {type === 'voltage-current' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  )
}