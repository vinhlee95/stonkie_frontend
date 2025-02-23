import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface BreakdownItem {
  label: string;
  revenue: number;
  percentage: number;
}

interface RevenueDataItem {
  year: number;
  breakdown: BreakdownItem[];
}

interface RevenueTableProps {
  revenueData: RevenueDataItem[];
}

const RevenueTable: React.FC<RevenueTableProps> = ({ revenueData }) => {
  // Get unique labels for table headers
  const labels = Array.from(
    new Set(revenueData.flatMap(data => data.breakdown.map(item => item.label)))
  );

  return (
    <Box sx={{ mt: 4 }}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: 'background.paper',
                  padding: '12px 16px',
                }}
              >
                Products
              </TableCell>
              {revenueData.map(data => (
                <TableCell
                  key={data.year}
                  align="right"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'background.paper',
                    padding: '12px 16px',
                  }}
                >
                  {data.year}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((label, rowIndex) => (
              <TableRow
                key={label}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell
                  sx={{
                    padding: '12px 16px',
                  }}
                >
                  {label}
                </TableCell>
                {revenueData.map(data => {
                  const item = data.breakdown.find(b => b.label === label)
                  const value = item ? (item.revenue / 1e6).toFixed(2) : '—'
                  return (
                    <TableCell
                      key={data.year}
                      align="right"
                      sx={{
                        padding: '12px 16px',
                      }}
                    >
                      {value === '—' ? '—' : `${value}`}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RevenueTable;
