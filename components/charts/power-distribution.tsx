'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { ExperimentDataPoint } from '@/types'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface PowerDistributionProps {
  data: ExperimentDataPoint[]
}

export default function PowerDistribution({ data }: PowerDistributionProps) {
  // 计算功率分布
  const powerRanges = [
    { min: 0, max: 2, label: '0-2W', count: 0 },
    { min: 2, max: 4, label: '2-4W', count: 0 },
    { min: 4, max: 6, label: '4-6W', count: 0 },
    { min: 6, max: 8, label: '6-8W', count: 0 },
    { min: 8, max: 10, label: '8-10W', count: 0 },
    { min: 10, max: Infinity, label: '>10W', count: 0 },
  ]

  data.forEach(d => {
    const power = d.power || 0
    const range = powerRanges.find(r => power >= r.min && power < r.max)
    if (range) {
      range.count++
    }
  })

  const chartData = {
    labels: powerRanges.map(r => r.label),
    datasets: [
      {
        label: '数据点数量',
        data: powerRanges.map(r => r.count),
        backgroundColor: [
          'rgba(0, 212, 255, 0.6)',
          'rgba(0, 255, 136, 0.6)',
          'rgba(255, 184, 0, 0.6)',
          'rgba(255, 107, 107, 0.6)',
          'rgba(124, 58, 237, 0.6)',
          'rgba(255, 56, 56, 0.6)',
        ],
        borderColor: [
          '#00D4FF',
          '#00FF88',
          '#FFB800',
          '#FF6B6B',
          '#7C3AED',
          '#FF3838',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 58, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00D4FF',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            const percentage = ((context.parsed.y / data.length) * 100).toFixed(1)
            return `数量: ${context.parsed.y} (${percentage}%)`
          }
        }
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#999',
          font: {
            size: 11,
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#999',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: '数据点数量',
          color: '#999',
          font: {
            size: 11,
          },
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}