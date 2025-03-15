import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Statements from './Statements';
import { Box, Tab, Tabs, CircularProgress } from '@mui/material';
import { FinancialData, ReportType } from '../types';
import Revenue from './Revenue';

interface TickerDetailProps {
  defaultTab: 'overview' | 'statements' | 'revenue';
  fetchFinancialData: (ticker: string, reportTypes?: ReportType[]) => Promise<any>;
  financialData: Record<ReportType, FinancialData | null>;
  error: string | null;
  setCurrentTicker: (ticker: string) => void;
}

const TickerDetail: React.FC<TickerDetailProps> = ({ defaultTab, financialData, fetchFinancialData, error, setCurrentTicker }) => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultTab);
  const isFetchingRef = useRef(false);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if(newValue !== 'overview' && newValue !== 'statements' && newValue !== 'revenue') {
      return
    }
    setValue(newValue);
    navigate(`/tickers/${ticker}/${newValue}`);
  };

  // Revenue tab does not need data from financial statements
  const isTabUsingFinancialStatementData = value === 'overview' || value === 'statements'

  // Fetch financial data if not already fetched
  useEffect(() => {
    const fetchData = async () => {
      if (!financialData?.income_statement && 
          !financialData?.balance_sheet && 
          !financialData?.cash_flow && 
          ticker && !error && 
          !isFetchingRef.current && 
          isTabUsingFinancialStatementData) {
        try {
          isFetchingRef.current = true;
          await fetchFinancialData(ticker);
        } catch (error) {
          console.error('Error fetching financial data:', error);
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    fetchData();
  }, [ticker, financialData, fetchFinancialData, error]);

  useEffect(() => {
    const refetchData = async () => {
      if(ticker && !isFetchingRef.current && isTabUsingFinancialStatementData) {
        try {
          isFetchingRef.current = true;
          await fetchFinancialData(ticker)
        } catch (error) {
          console.error('Error fetching financial data:', error);
        } finally {
          isFetchingRef.current = false;
        }
      }
    }

    refetchData()
  }, [ticker]);

  useEffect(() => {
    if (ticker) {
      setCurrentTicker(ticker.toUpperCase());
    }
  }, [ticker]);

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
        <Tab value="revenue" label="Revenue" />
      </Tabs>

      {value === 'overview' && financialData && ticker && (
        <Overview financialData={financialData} ticker={ticker} />
      )}
      {value === 'statements' && financialData && (
        <Statements financialData={financialData} />
      )}
      {value === 'revenue' && financialData && (
        <Revenue />
      )}
    </Box>
  );
};

export default TickerDetail;