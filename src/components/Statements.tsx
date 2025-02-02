import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab } from '@mui/material';
import { FinancialData, ReportType } from '../types';
import { formatNumber } from '../utils/formatters';

interface StatementsProps {
  financialData: Record<ReportType, FinancialData | null>;
}

const HIGHLIGHTED_BALANCE_SHEET_ROWS = ['Total assets', 'Total liabilities', 'Total equity'];   
const HIGHLIGHTED_INCOME_STATEMENT_ROWS = ['Total revenue', 'Gross profit', 'Net income'];
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
      return HIGHLIGHTED_ROWS.includes(firstCellValue.toLowerCase())
    };

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          All numbers are in thousands of USD.
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
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

  return (
    <Box>
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