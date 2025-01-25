import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Statements from './Statements';
import { Box, Tab, Tabs, CircularProgress } from '@mui/material';
import { FinancialData, ReportType } from '../types';

interface TickerDetailProps {
  defaultTab: 'overview' | 'statements';
  financialData?: Record<ReportType, FinancialData | null>;
}

const TickerDetail: React.FC<TickerDetailProps> = ({ defaultTab, financialData }) => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultTab);

  // Show loading or error state if no data
  if (!financialData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if(newValue !== 'overview' && newValue !== 'statements') {
      return
    }
    
    setValue(newValue);
    navigate(`/tickers/${ticker}/${newValue}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
      >
        <Tab value="overview" label="Overview" />
        <Tab value="statements" label="Financial Statements" />
      </Tabs>

      {value === 'overview' && financialData && (
        <Overview financialData={financialData} />
      )}
      {value === 'statements' && financialData && (
        <Statements financialData={financialData} />
      )}
    </Box>
  );
};

export default TickerDetail;