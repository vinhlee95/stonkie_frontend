import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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

  return (
    <>
      {renderTable(financialData.income_statement, 'Income Statement')}
      {renderTable(financialData.balance_sheet, 'Balance Sheet')}
      {renderTable(financialData.cash_flow, 'Cash Flow Statement')}
    </>
  );
};

export default Statements; 