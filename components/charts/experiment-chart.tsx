'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ExperimentChartProps {
  data: ExperimentDataPoint[]
}

export default function ExperimentChart({ data }: ExperimentChartProps) {
  // 准备图表数据
  const chartData = {
    labels: data.map(d => d.sequence_number?.toString() || ''),
    datasets: [
      {
        label: '电压 (V)',
        data: data.map(d => d.voltage || 0),
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: '电流 (A)',
        data: data.map(d => d.current || 0),
        borderColor: '#00FF88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: '功率 (W)',
        data: data.map(d => d.power || 0),
        borderColor: '#FFB800',
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
        tension: 0.4,
        yAxisID: 'y2',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 58, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00D4FF',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '数据序号',
          color: '#999',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#999',
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '电压 (V)',
          color: '#00D4FF',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#00D4FF',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '电流 (A)',
          color: '#00FF88',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#00FF88',
        },
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        offset: true,
        title: {
          display: true,
          text: '功率 (W)',
          color: '#FFB800',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#FFB800',
        },
      },
    },
  }

  return (
    <div className="h-[400px] w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}