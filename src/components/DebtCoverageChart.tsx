import React from 'react';
import { FinancialData } from '../types';
import FinancialChart from './FinancialChart';

interface DebtCoverageChartProps {
  balanceSheet: FinancialData | null;
  cashFlow: FinancialData | null;
}

const DebtCoverageChart: React.FC<DebtCoverageChartProps> = ({ balanceSheet, cashFlow }) => {
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
        backgroundColor: '#4287f5',
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
        backgroundColor: '#63e6e2',
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
        backgroundColor: '#ff9f40',
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

export default DebtCoverageChart; 