import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { formatNumber } from '../../utils/formatters'; // We'll move formatNumber to a utility file

interface KeyStatsProps {
  keyStats: {
    market_cap: number;
    pe_ratio: number;
    revenue: number;
    net_income: number;
    basic_eps: number;
    dividend_yield: number;
  } | null;
}

const KeyStats: React.FC<KeyStatsProps> = ({ keyStats }) => {
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

export default KeyStats; 