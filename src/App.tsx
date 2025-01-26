import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FinancialData, ReportType } from './types';
import {
  Alert,
  Box,
  Container,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import FinancialChatbox from './components/FinancialChatbox';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend,
  BarController,
  LineController
} from 'chart.js';
import CompanySearch from './components/CompanySearch';
import TickerDetail from './components/TickerDetail';
import Home from './components/Home';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const theme = createTheme({
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
  },
});

// Lift the state and handlers to App
const App: React.FC = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<Record<ReportType, FinancialData | null>>({
    income_statement: null,
    balance_sheet: null,
    cash_flow: null
  });
  const [ticker, setTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Move these functions from Home to App
  const fetchFinancialData = async (ticker: string, reportType: ReportType) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/financial-data/${ticker.toLowerCase()}/${reportType}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No ${reportType.replace(/_/g, ' ')} data found for ${ticker}`);
        }
        throw new Error(`Failed to fetch ${reportType.replace(/_/g, ' ')} data (${response.status})`);
      }

      const data = await response.json();
      setFinancialData(prev => ({
        ...prev,
        [reportType]: data
      }));
      
      // Use navigate instead of navigator
      navigate(`/tickers/${ticker.toLowerCase()}/overview`);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error fetching ${reportType.replace(/_/g, ' ')}: ${err.message}`);
      }
      throw new Error(`Unexpected error fetching ${reportType.replace(/_/g, ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setError(null);
    try {
      const reportTypes: ReportType[] = ['income_statement', 'balance_sheet', 'cash_flow'];
      await Promise.all(reportTypes.map(type => fetchFinancialData(ticker, type)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <CompanySearch
          ticker={ticker}
          loading={loading}
          onTickerChange={handleTickerChange}
          onSubmit={handleSubmit}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Routes>
          <Route path="/" element={<Home 
            financialData={financialData}
          />} />
          <Route 
            path="/tickers/:ticker/overview" 
            element={<TickerDetail 
              defaultTab="overview" 
              financialData={financialData}
              fetchFinancialData={fetchFinancialData}
              loading={loading}
            />} 
          />
          <Route 
            path="/tickers/:ticker/statements" 
            element={<TickerDetail 
              defaultTab="statements" 
              financialData={financialData}
              fetchFinancialData={fetchFinancialData}
              loading={loading}
            />} 
          />
        </Routes>

        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            boxShadow: 20,
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <FinancialChatbox 
            ticker={ticker} 
            initialMessage="Hi! My name is Stonkie, your stock agent. Feel free to ask me anything about a particular stock you are interested in."
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App; 