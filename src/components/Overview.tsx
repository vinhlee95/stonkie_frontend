import React from 'react';
import { Grid, Box } from '@mui/material';
import { FinancialData, ReportType } from '../types'
import KeyStats from './overview/KeyStats';
import GrowthChart from './overview/GrowthChart';
import EPSChart from './overview/EPSChart';
import DebtCoverageChart from './overview/DebtCoverageChart';
import SWOT from './overview/SwotAnalysis';

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
  return (
    <Box>
      <KeyStats ticker={ticker} />
      <SWOT />
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