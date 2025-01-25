import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FinancialData, ReportType } from './types';
import {
  Alert,
  Box,
  Container,
  createTheme,
  ThemeProvider,
  Tabs,
  Tab,
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
import Overview from './components/Overview';
import Statements from './components/Statements';
import CompanySearch from './components/CompanySearch';

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

// Create a new Home component to contain the existing content
const Home: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<Record<ReportType, FinancialData | null>>({
    income_statement: null,
    balance_sheet: null,
    cash_flow: null
  });
  const [activeTab, setActiveTab] = useState(0);

  const fetchFinancialData = async (reportType: ReportType) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${BACKEND_URL}/api/financial-data/${ticker.toLowerCase()}/${reportType}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${reportType} data`);
      }

      const data = await response.json();
      setFinancialData(prev => ({
        ...prev,
        [reportType]: data
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    const reportTypes: ReportType[] = ['income_statement', 'balance_sheet', 'cash_flow'];
    await Promise.all(reportTypes.map(type => fetchFinancialData(type)));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker);
  };

  return (
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

      {(financialData.income_statement || financialData.balance_sheet || financialData.cash_flow) && (
        <>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Tab label="Overview" />
            <Tab label="Statements" />
          </Tabs>

          {activeTab === 0 && <Overview financialData={financialData} />}
          {activeTab === 1 && <Statements financialData={financialData} />}
        </>
      )}

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
  );
};

// Refactored App component with Router
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App; 