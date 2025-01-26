import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Statements from './Statements';
import { Box, Tab, Tabs, CircularProgress } from '@mui/material';
import { FinancialData, ReportType } from '../types';

interface TickerDetailProps {
  defaultTab: 'overview' | 'statements';
  fetchFinancialData: (ticker: string, reportType: ReportType) => Promise<any>;
  financialData: Record<ReportType, FinancialData | null>;
  loading: boolean;
}

const TickerDetail: React.FC<TickerDetailProps> = ({ defaultTab, financialData, fetchFinancialData, loading }) => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultTab);
  const isFetchingRef = useRef(false);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if(newValue !== 'overview' && newValue !== 'statements') {
      return
    }
    
    setValue(newValue);
    navigate(`/tickers/${ticker}/${newValue}`);
  };

  // Fetch financial data if not already fetched
  useEffect(() => {
    const fetchData = async () => {
      if (!financialData?.income_statement && 
          !financialData?.balance_sheet && 
          !financialData?.cash_flow && 
          ticker && 
          !isFetchingRef.current) {
        try {
          isFetchingRef.current = true;
          const reportTypes: ReportType[] = ['income_statement', 'balance_sheet', 'cash_flow'];
          await Promise.all(reportTypes.map(type => fetchFinancialData(ticker, type)));
        } catch (error) {
          console.error('Error fetching financial data:', error);
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    fetchData();
  }, [ticker, financialData, fetchFinancialData, loading]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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