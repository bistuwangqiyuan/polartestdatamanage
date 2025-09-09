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
  Filler,
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
  Legend,
  Filler
)

interface RealtimeChartProps {
  data: ExperimentDataPoint[]
}

export default function RealtimeChart({ data }: RealtimeChartProps) {
  const chartData = {
    labels: data.map((_, index) => index.toString()),
    datasets: [
      {
        label: '电压 (V)',
        data: data.map(d => d.voltage || 0),
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: '功率 (W)',
        data: data.map(d => d.power || 0),
        borderColor: '#FFB800',
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          padding: 15,
          font: {
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 58, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00D4FF',
        borderWidth: 1,
        padding: 10,
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
        display: false,
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#00D4FF',
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: '电压 (V)',
          color: '#00D4FF',
          font: {
            size: 11,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
          drawBorder: false,
        },
        ticks: {
          color: '#FFB800',
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: '功率 (W)',
          color: '#FFB800',
          font: {
            size: 11,
          },
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}