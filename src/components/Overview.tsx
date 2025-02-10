import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { FinancialData, ReportType } from '../types'
import FinancialChart from './FinancialChart';

// Add new interface for key stats
interface KeyStats {
  market_cap: number;
  pe_ratio: number;
  revenue: number;
  net_income: number;
  basic_eps: number;
  dividend_yield: number;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

interface OverviewProps {
  financialData: Record<ReportType, FinancialData | null>;
  ticker: string; // Add ticker prop
}

const Overview: React.FC<OverviewProps> = ({ financialData, ticker }) => {
  const [keyStats, setKeyStats] = React.useState<KeyStats | null>(null);

  React.useEffect(() => {
    const fetchKeyStats = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/key-stats`);
        const data = await response.json();
        setKeyStats(data.data);
      } catch (error) {
        console.error('Error fetching key stats:', error);
      }
    };

    fetchKeyStats();
  }, [ticker]);

  // Add new function to format numbers
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  const formatNumber = (num: number, isCurrency: boolean = false): string => {
    if (num >= 1e12) {
      return `${isCurrency ? '$' : ''}${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
    }
    return `${isCurrency ? '$' : ''}${num.toFixed(2)}`;
  };

  // Add new component for key stats
  const renderKeyStats = () => {
    if (!keyStats) return null;

    return (
      <Paper sx={{ p: 2, background: 'transparent' }} elevation={0}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Key Stats
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Market capitalization
              </Typography>
              <Typography variant="h6">
                {formatNumber(keyStats.market_cap, true)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Price to earnings Ratio (TTM)
              </Typography>
              <Typography variant="h6">
                {keyStats.pe_ratio.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Dividend yield (indicated)
              </Typography>
              <Typography variant="h6">
                {(keyStats.dividend_yield * 100).toFixed(2)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Basic EPS (TTM)
              </Typography>
              <Typography variant="h6">
                ${keyStats.basic_eps.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Net income (FY)
              </Typography>
              <Typography variant="h6">
                {formatNumber(keyStats.net_income, true)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Revenue (FY)
              </Typography>
              <Typography variant="h6">
                {formatNumber(keyStats.revenue, true)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderGrowthChart = (data: FinancialData | null) => {
    if (!data) return null;
    const columns = data.columns
    
    const revenueRow = data.data.find(row => {
      const metric = row[columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('revenue') && 
        !metric.toLowerCase().includes('cost');
    });
    const netIncome = data.data.find(row => {
      const metric = row[columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('net income');
    });

    // Reverse the columns array (except the first column which contains metrics)
    const reversedColumns = [data.columns[0], ...data.columns.slice(1).reverse()];
    
    // Update the data rows to match the reversed column order
    const reversedData = data.data.map(row => {
      const rowValues = Object.values(row);
      return [rowValues[0], ...rowValues.slice(1).reverse()];
    });

    // Update the data object with reversed columns and data
    data = {
      ...data,
      columns: reversedColumns,
      data: reversedData.map(row => {
        const obj: Record<string, string | number> = {};
        reversedColumns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      })
    };

    if (!revenueRow || !netIncome) return null;

    const years = data.columns.slice(1);
    
    // Calculate net margin with 2 decimal places
    const netMarginData = years.map(year => {
      const revenue = parseFloat(revenueRow[year].toString().replace(/[^0-9.-]+/g, ''));
      const income = parseFloat(netIncome[year].toString().replace(/[^0-9.-]+/g, ''));
      return Number(((income / revenue) * 100).toFixed(2)); // Round to 2 decimal places
    });

    const datasets = [
      {
        type: 'bar' as const,
        label: 'Revenue',
        data: years.map(year => parseFloat(revenueRow[year].toString().replace(/[^0-9.-]+/g, ''))),
        backgroundColor: '#4287f5',
        borderColor: '#4287f5',
        borderWidth: 0,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Net income',
        data: years.map(year => parseFloat(netIncome[year].toString().replace(/[^0-9.-]+/g, ''))),
        backgroundColor: '#63e6e2',
        borderColor: '#63e6e2',
        borderWidth: 0,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Net Margin (%)',
        data: netMarginData,
        borderColor: '#ff9f40',
        borderWidth: 2,
        pointBackgroundColor: '#ff9f40',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        yAxisID: 'percentage',
        tension: 0.4,
      },
    ];

    return (
      <FinancialChart
        title="Growth and Profitability"
        labels={years}
        datasets={datasets}
        yAxisConfig={{ formatAsCurrency: true, showPercentage: true }}
        yAxisFormat={(value) => `$${(value / 1000000).toFixed(1)}B`}
      />
    );
  };

  const renderEPSChart = (data: FinancialData | null) => {
    if (!data) return null;
    const columns = data.columns;

    const basicEPS = data.data.find(row => {
      const metric = row[columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('basic eps');
    });
    const dilutedEPS = data.data.find(row => {
      const metric = row[columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('diluted eps');
    });

    if (!basicEPS || !dilutedEPS) return null;

    // Use the same column reversal logic as the main chart
    const years = data.columns.slice(1).reverse();

    const chartData = {
      labels: years,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Basic EPS',
          data: years.map(year => {
            if(!basicEPS[year]) return 0
            return parseFloat(basicEPS[year].toString().replace(/[^0-9.-]+/g, ''))
          }),
          backgroundColor: '#4287f5', // Solid blue color
          borderColor: '#4287f5',
          borderWidth: 0, // Remove border
          borderRadius: 4, // Rounded corners
        },
        {
          type: 'bar' as const,
          label: 'Diluted EPS',
          data: years.map(year => {
            if(!dilutedEPS[year]) return 0
            return parseFloat(dilutedEPS[year].toString().replace(/[^0-9.-]+/g, ''))
          }),
          backgroundColor: '#63e6e2', // Solid turquoise color
          borderColor: '#63e6e2',
          borderWidth: 0, // Remove border
          borderRadius: 4, // Rounded corners
        },
      ],
    };

    return (
      <FinancialChart
        title="Earnings Per Share"
        labels={years}
        datasets={chartData.datasets}
        yAxisConfig={{ formatAsCurrency: true, showPercentage: false }}
        yAxisFormat={(value) => `$${value.toFixed(2)}`}
      />
    );
  };

  const renderDebtCoverageChart = (balanceSheet: FinancialData | null, cashFlow: FinancialData | null) => {
    if (!balanceSheet || !cashFlow) return null;
    
    const totalDebt = balanceSheet.data.find(row => {
      const metric = row[balanceSheet.columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('total debt');
    });

    const cash = balanceSheet.data.find(row => {
      const metric = row[balanceSheet.columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase() === 'cash';
    });

    const cashEquivalents = balanceSheet.data.find(row => {
      const metric = row[balanceSheet.columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase() === 'cash equivalents';
    });

    const cashAndCashEquivalents = balanceSheet.data.find(row => {
      const metric = row[balanceSheet.columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('cash and cash');
    });

    const freeCashFlow = cashFlow.data.find(row => {
      const metric = row[cashFlow.columns[0]];
      return typeof metric === 'string' && 
        metric.toLowerCase().includes('free cash flow');
    });

    if (!totalDebt || !freeCashFlow) return null;

    // Use the same column reversal logic as the main chart
    const years = balanceSheet.columns.slice(1).reverse();

    const chartData = {
      labels: years,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Total Debt',
          data: years.map(year => {
            if(!totalDebt[year]) return 0;
            return parseFloat(totalDebt[year].toString().replace(/[^0-9.-]+/g, ''));
          }),
          backgroundColor: '#4287f5', // Solid blue color
          borderColor: '#4287f5',
          borderWidth: 0,
          borderRadius: 4,
        },
        {
          type: 'bar' as const,
          label: 'Free Cash Flow',
          data: years.map(year => {
            if(!freeCashFlow[year]) return 0;
            return parseFloat(freeCashFlow[year].toString().replace(/[^0-9.-]+/g, ''));
          }),
          backgroundColor: '#63e6e2', // Solid turquoise color
          borderColor: '#63e6e2',
          borderWidth: 0,
          borderRadius: 4,
        },
        {
          type: 'bar' as const,
          label: 'Cash and Cash Equivalents',
          data: years.map(year => {
            if(!cash && !cashEquivalents && !cashAndCashEquivalents) return 0;
            if(cash && cashEquivalents) {
              if(!cash[year] || !cashEquivalents[year]) return 0;
              const cashValue = parseFloat(cash[year].toString().replace(/[^0-9.-]+/g, ''));
              const equivalentsValue = parseFloat(cashEquivalents[year].toString().replace(/[^0-9.-]+/g, ''));
              return cashValue + equivalentsValue;
            }
            if(!cashAndCashEquivalents || !cashAndCashEquivalents[year]) return 0;
            return parseFloat(cashAndCashEquivalents[year].toString().replace(/[^0-9.-]+/g, ''));
          }),
          backgroundColor: '#ff9f40', // Solid orange color
          borderColor: '#ff9f40',
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    };

    return (
      <FinancialChart
        title="Debt and Coverage"
        labels={years}
        datasets={chartData.datasets}
        yAxisConfig={{ formatAsCurrency: true, showPercentage: false }}
        yAxisFormat={(value) => `$${(value / 1000000).toFixed(1)}B`}
      />
    );
  };

  return (
    <Box sx={{ 
      height: '100vh',
      overflow: 'hidden',
      paddingBottom: 0
    }}>
      {renderKeyStats()}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {renderGrowthChart(financialData.income_statement)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderEPSChart(financialData.income_statement)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderDebtCoverageChart(financialData.balance_sheet, financialData.cash_flow)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 