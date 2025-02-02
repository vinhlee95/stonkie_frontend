import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab } from '@mui/material';
import { FinancialData, ReportType } from '../types';
import { formatNumber } from '../utils/formatters';
import  FinancialChart from './FinancialChart';

interface StatementsProps {
  financialData: Record<ReportType, FinancialData | null>;
}

const HIGHLIGHTED_BALANCE_SHEET_ROWS = ['Total assets', 'Total liabilities', 'Total equity', 'Common Stock Equity'];   
const HIGHLIGHTED_INCOME_STATEMENT_ROWS = ['Total revenue', 'Gross profit', 'Net income', 'EPS', 'EBIT'];
const HIGHLIGHTED_CASH_FLOW_ROWS = ['Operating cash flow', 'Financing cash flow', 'Free cash flow'];

const HIGHLIGHTED_ROWS = [...HIGHLIGHTED_BALANCE_SHEET_ROWS, ...HIGHLIGHTED_INCOME_STATEMENT_ROWS, ...HIGHLIGHTED_CASH_FLOW_ROWS].map(row => row.trim().toLowerCase());

const Statements: React.FC<StatementsProps> = ({ financialData }) => {
  const [currentTab, setCurrentTab] = useState<ReportType>('income_statement');

  const handleTabChange = (event: React.SyntheticEvent, newValue: ReportType) => {
    setCurrentTab(newValue);
  };

  const renderTable = (data: FinancialData | null, title: string) => {
    if (!data) return null;

    const formatCellValue = (value: any, column: string): string => {
      // Don't format the first column (usually metric names)
      if (column === data.columns[0]) return value;
      return formatNumber(value);
    };

    const isHighlightedRow = (firstCellValue: string): boolean => {
      return HIGHLIGHTED_ROWS.some(row => firstCellValue.toLowerCase().includes(row));
    };

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          All numbers are in thousands of USD.
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {data.columns.map((column, index) => (
                  <TableCell
                    key={index}
                    align={index === 0 ? 'left' : 'right'}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'background.paper'
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((row, rowIndex) => {
                const isHighlighted = isHighlightedRow(String(row[data.columns[0]]));
                return (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                      ...(isHighlighted && {
                        backgroundColor: '#6b9fff',
                        '& .MuiTableCell-root': {
                          color: 'common.white',
                          fontWeight: 'bold',
                          padding: '12px 16px',
                        },
                        '&:nth-of-type(odd)': {
                          backgroundColor: '#6b9fff',
                        },
                      }),
                    }}
                  >
                    {data.columns.map((column, colIndex) => (
                      <TableCell 
                        key={colIndex}
                        align={colIndex === 0 ? 'left' : 'right'}
                      >
                        {formatCellValue(row[column], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const getTabData = () => {
    switch (currentTab) {
      case 'income_statement':
        return renderTable(financialData.income_statement, 'Income Statement');
      case 'balance_sheet':
        return renderTable(financialData.balance_sheet, 'Balance Sheet');
      case 'cash_flow':
        return renderTable(financialData.cash_flow, 'Cash Flow Statement');
      default:
        return null;
    }
  };

  const renderIncomeStatementChart = () => {
    if (currentTab !== 'income_statement' || !financialData.income_statement) return null;

    const metricsMap = {
      'totalRevenue': 'Total Revenue',
      'grossProfit': 'Gross Profit',
      'operatingIncome': 'Operating Income',
      'pretaxIncome': 'Pretax Income',
      'netIncome': 'Net Income',
    };

    const metrics = [
      { label: 'Total Revenue', key: 'totalRevenue', color: '#3b82f6' },
      { label: 'Gross Profit', key: 'grossProfit', color: '#10b981' },
      { label: 'Operating Income', key: 'operatingIncome', color: '#f59e0b' },
      { label: 'Pretax Income', key: 'pretaxIncome', color: '#8b5cf6' },
      { label: 'Net Income', key: 'netIncome', color: '#ef4444' },
    ];

    // Get all years from the data (excluding 'Breakdown' and 'TTM' columns)
    const years = Object.keys(financialData.income_statement.data[0])
      .filter(key => key !== 'Breakdown' && key !== 'TTM')
      .sort()
      .reverse();

    const datasets = metrics.map(metric => ({
      type: 'bar' as const,
      label: metric.label,
      data: years.map(year => {
        const row = financialData.income_statement?.data.find(
          row => row['Breakdown'] === metricsMap[metric.key as keyof typeof metricsMap]
        );
        return row ? Number(row[year]) / 1000000 : 0; // Convert to billions (divide by 1M instead of 1K)
      }),
      backgroundColor: metric.color,
      borderColor: metric.color,
      borderRadius: 4,
      barPercentage: 0.7,
    }));

    return (
      <FinancialChart
        title=""
        labels={years}
        datasets={datasets}
        height={200}
        marginTop={0}
        yAxisFormat={(value) => `${value} B`} // Add B suffix to y-axis values
      />
    );
  };

  const renderBalanceSheetChart = () => {
    if (currentTab !== 'balance_sheet' || !financialData.balance_sheet) return null;

    const metrics = [
      { label: 'Total Assets', key: 'total assets', color: '#3b82f6' },
      { label: 'Total Liabilities', key: 'total liabilities', color: '#ef4444' },
    ];

    // Get all years from the data (excluding 'Breakdown' and 'TTM' columns)
    const years = Object.keys(financialData.balance_sheet.data[0])
      .filter(key => key !== 'Breakdown' && key !== 'TTM')
      .sort()
      .reverse();

    const datasets = metrics.map(metric => ({
      type: 'bar' as const,
      label: metric.label,
      data: years.map(year => {
        const row = financialData.balance_sheet?.data.find(
          row => {
            if(!row['Breakdown'] || typeof row['Breakdown'] !== 'string') return false;
            return row['Breakdown'].trim().toLowerCase().includes(metric.key.trim().toLowerCase());
          }
        );
        return row ? Number(row[year]) / 1000000 : 0; // Convert to billions
      }),
      backgroundColor: metric.color,
      borderColor: metric.color,
      borderRadius: 4,
      barPercentage: 0.5,
    }));

    return (
      <FinancialChart
        title=""
        labels={years}
        datasets={datasets}
        height={200}
        marginTop={0}
        yAxisFormat={(value) => `${value} B`}
      />
    );
  };

  return (
    <Box>
      {currentTab === 'income_statement' ? renderIncomeStatementChart() : renderBalanceSheetChart()}
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          mt: 2,
          borderRadius: '25px',
          padding: '8px',
          '& .MuiTab-root': {
            borderRadius: '20px',
            minHeight: '40px',
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 500,
            color: 'text.primary',
            '&.Mui-selected': {
              backgroundColor: 'rgba(107, 159, 255, 0.1)',
              color: 'text.primary',
            },
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        <Tab 
          label="Income statement" 
          value="income_statement"
          sx={{ mr: 1 }}
        />
        <Tab 
          label="Balance sheet" 
          value="balance_sheet"
          sx={{ mr: 1 }}
        />
        <Tab 
          label="Cash flow" 
          value="cash_flow"
        />
      </Tabs>
      {getTabData()}
    </Box>
  );
};

export default Statements; 