import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { formatNumber } from '../../utils/formatters'; // We'll move formatNumber to a utility file
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../../utils/db';

interface KeyStats {
  market_cap: number;
  pe_ratio: number;
  revenue: number;
  net_income: number;
  basic_eps: number;
  dividend_yield: number;
}

interface KeyStatsProps {
  ticker: string;
}

const fetchKeyStats = async (ticker: string) => {
  const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/key-stats`);
  return (await response.json()).data;
}

const KeyStatComponent: React.FC<KeyStatsProps> = ({ ticker }) => {
  const { data: keyStats, isLoading, error } = useQuery<KeyStats>({
    queryKey: ['keyStats', ticker],
    queryFn: () => fetchKeyStats(ticker),
    staleTime: 1000 * 60 * 5, // cache the data for 5 minutes
    retry: 2,
  });

  if(!isLoading && error) {
    return null
  }

  // Render skeleton UI while loading
  if (isLoading || !keyStats) {
    return (
      <Paper sx={{ p: 2, background: 'transparent' }} elevation={0}>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ width: '80%', height: 20 }}>
                  <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)', height: '100%', width: '100%', borderRadius: 1 }} />
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, width: '60%', height: 28 }}>
                  <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)', height: '100%', width: '100%', borderRadius: 1 }} />
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, background: 'transparent' }} elevation={0}>
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

export default KeyStatComponent; 