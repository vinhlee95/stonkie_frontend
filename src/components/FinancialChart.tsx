import React from 'react';
import { Box, Typography } from '@mui/material';
import { Chart } from 'react-chartjs-2';

interface Dataset {
  type: 'bar' | 'line';
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor: string;
  borderWidth?: number;
  borderRadius?: number;
  yAxisID?: string;
  pointBackgroundColor?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  fill?: boolean;
  tension?: number;
}

interface ChartProps {
  title: string;
  labels: string[];
  datasets: Dataset[];
  height?: number;
  marginTop?: number;
  yAxisConfig?: {
    showPercentage?: boolean;
    formatAsCurrency?: boolean;
  };
}

const FinancialChart: React.FC<ChartProps> = ({
  title,
  labels,
  datasets,
  height = 250,
  marginTop = 4,
  yAxisConfig = { formatAsCurrency: true, showPercentage: false }
}) => {
  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          callback: function(value: any): string {
            if (typeof value !== 'number') return '';
            if (!yAxisConfig.formatAsCurrency) return `${value}`;
            return value >= 1e9 
              ? `$${(value / 1e9).toFixed(1)}B`
              : value >= 1e6
              ? `$${(value / 1e6).toFixed(1)}M`
              : `$${value}`;
          },
        },
      },
      ...(yAxisConfig.showPercentage && {
        percentage: {
          beginAtZero: true,
          position: 'right' as const,
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 12,
            },
            callback: function(value: any): string {
              return `${Number(value).toFixed(0)}%`;
            },
          },
        },
      }),
    },
  };

  return (
    <Box sx={{ 
      height,
      mt: marginTop,
      borderRadius: 2,
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 2,
          fontWeight: 500,
          fontSize: '1.5rem',
        }}
      >
        {title}
      </Typography>
      <Chart type='bar' data={chartData} options={options} />
    </Box>
  );
};

export default FinancialChart; 