import React, { useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FinancialData, ReportType } from './types';
import {
  Alert,
  Box,
  Container,
  createTheme,
  ThemeProvider,
  Snackbar,
  IconButton,
  useMediaQuery,
  PaletteMode
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
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return (savedMode as PaletteMode) || (prefersDarkMode ? 'dark' : 'light');
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [financialData, setFinancialData] = useState<Record<ReportType, FinancialData | null>>({
    income_statement: null,
    balance_sheet: null,
    cash_flow: null
  });
  const [ticker, setTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const isDesktop = useMediaQuery('(min-width:600px)');

  // Move these functions from Home to App
  const fetchFinancialData = async (ticker: string, reportTypes: ReportType[] = ['income_statement', 'balance_sheet', 'cash_flow']) => {
    setLoading(true);
    try {
      const data = await Promise.all(reportTypes.map(async type => {
        const res = await fetch(
          `${BACKEND_URL}/api/financial-data/${ticker.toLowerCase()}/${type}`
        )
        
        return {
          [type]: await res.json()
        }
      }));

      // Transform array of objects into single object
      const mergedData = data.reduce((acc, curr) => ({
        ...acc,
        ...curr
      }), {}) as Record<ReportType, FinancialData | null>;

      setFinancialData(mergedData);
    } catch (err) {
      setError("Fetching available data is not available right now");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setError(null);
    try {
      await fetchFinancialData(ticker);
      navigate(`/tickers/${ticker.toLowerCase()}/overview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Add effect to reset ticker when on home route
  React.useEffect(() => {
    if (location.pathname === '/') {
      setTicker('');
    }
  }, [location.pathname]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
          }}>
            <CompanySearch
              ticker={ticker}
              loading={loading}
              onTickerChange={handleTickerChange}
              onSubmit={handleSubmit}
            />
            <Box>
              <IconButton 
                onClick={toggleColorMode} 
                color="inherit"
                sx={{
                  marginTop: isDesktop ? 1.5 : 0
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Box>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/tickers/:ticker/overview" 
              element={<TickerDetail 
                defaultTab="overview" 
                financialData={financialData}
                fetchFinancialData={fetchFinancialData}
                loading={loading}
                error={error}
                setCurrentTicker={setTicker}
              />} 
            />
            <Route 
              path="/tickers/:ticker/statements" 
              element={<TickerDetail 
                defaultTab="statements" 
                financialData={financialData}
                fetchFinancialData={fetchFinancialData}
                loading={loading}
                error={error}
                setCurrentTicker={setTicker}
              />} 
            />
          </Routes>

          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2
            }}
          >
            <Box sx={{ boxShadow: 20, maxWidth: '500px', width: '100%' }}>
              <FinancialChatbox ticker={ticker} />
            </Box>
          </Box>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2500}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleSnackbarClose} 
              severity="error" 
              sx={{ width: '100%' }}
            >
              {error}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App; 