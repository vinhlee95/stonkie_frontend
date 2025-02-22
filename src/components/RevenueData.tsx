import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BreakdownItem {
  label: string
  revenue: number
  percentage: number
}

interface RevenueDataItem {
  year: number
  breakdown: BreakdownItem[]
}

interface RevenueChartProps {
  revenueData: RevenueDataItem[]
}

export default function RevenueChart({ revenueData }: RevenueChartProps) {
  // Transform data for Chart.js
  const years = revenueData.map((data) => data.year.toString())
  
  // Get unique labels from all breakdowns
  const labels = Array.from(
    new Set(revenueData.flatMap((data) => data.breakdown.map((item) => item.label)))
  )

  // Prepare datasets
  const datasets = labels.map((label, index) => ({
    label,
    data: revenueData.map((yearData) => {
      const item = yearData.breakdown.find((b) => b.label === label)
      return item?.revenue ?? 0
    }),
    backgroundColor: index === 0 ? "rgb(99, 132, 255)" : "rgb(72, 202, 228)",
    borderColor: "transparent",
  }))

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
          font: {
            size: 14,
          },
        },
        title: {
          display: true,
          text: 'Year',
          color: 'white',
          font: {
            size: 14,
          },
        },
      },
      y: {
        stacked: true,
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
          callback: (value: number) => `$${value.toFixed(2)}B`,
          font: {
            size: 14,
          },
        },
        title: {
          display: true,
          text: 'Revenue (Billion USD)',
          color: 'white',
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            const percentage = revenueData[context.dataIndex]?.breakdown
              .find((b) => b.label === context.dataset.label)?.percentage ?? 0
            return `${context.dataset.label}: ${value.toFixed(2)}B USD (${percentage.toFixed(1)}%)`
          },
        },
      },
    },
  }

  const data = {
    labels: years,
    datasets,
  }

  return (
    <div className="w-full h-[400px] bg-black p-4">
      <Bar options={options as any} data={data} />
    </div>
  )
}
