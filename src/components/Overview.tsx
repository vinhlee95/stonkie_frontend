import React from 'react';
import { Grid, Box } from '@mui/material';
import { FinancialData, ReportType } from '../types'
import KeyStats from './KeyStats';
import GrowthChart from './overview/GrowthChart';
import EPSChart from './overview/EPSChart';
import DebtCoverageChart from './overview/DebtCoverageChart';
import { useQuery } from '@tanstack/react-query';

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

const fetchKeyStats = async (ticker: string) => {
  const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/key-stats`);
  return (await response.json()).data;
}

const Overview: React.FC<OverviewProps> = ({ financialData, ticker }) => {
  const {data: keyStats} = useQuery({
    queryKey: ['keyStats', ticker],
    queryFn: () => fetchKeyStats(ticker),
    staleTime: 1000 * 60 * 5, // cache the data for 5 minutes
  })

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
          <DebtCoverageChart 
            balanceSheet={financialData.balance_sheet}
            cashFlow={financialData.cash_flow}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 