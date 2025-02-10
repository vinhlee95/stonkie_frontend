import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { FinancialData, ReportType } from '../types'
import FinancialChart from './FinancialChart';
import KeyStats from './KeyStats';
import GrowthChart from './GrowthChart';
import EPSChart from './EPSChart';

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
    <Box>
      <KeyStats keyStats={keyStats} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <GrowthChart data={financialData.income_statement} />
        </Grid>
        <Grid item xs={12} md={6}>
          <EPSChart data={financialData.income_statement} />
        </Grid>
        <Grid item xs={12} md={6}>
          {renderDebtCoverageChart(financialData.balance_sheet, financialData.cash_flow)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 