import { FinancialData, ReportType } from "../types";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RevenueChart from "./RevenueData";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface ProductRevenueBreakdown {
  product: string;
  revenue: number;
  percentage: number;
}

interface RegionRevenueBreakdown {
  region: string;
  revenue: number;
  percentage: number;
}

interface RevenueBreakdown {
  year: number;
  product_breakdown: ProductRevenueBreakdown[];
  region_breakdown: RegionRevenueBreakdown[];
}

interface APIResponse {
  data: RevenueBreakdown[];
}

interface RevenueProps {
  financialData: Record<ReportType, FinancialData | null>;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const Revenue = ({ financialData }: RevenueProps) => {
  const [revenueData, setRevenueData] = useState<RevenueBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchDataRef = useRef<boolean>(false);
  const { ticker } = useParams();

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (fetchDataRef.current) return;
      fetchDataRef.current = true;
      setIsLoading(true);

      try {
        const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/revenue`);
        const { data }: APIResponse = await response.json();
        setRevenueData(data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setIsLoading(false);
        fetchDataRef.current = false;
      }
    };

    fetchRevenueData();
  }, [ticker]);

  if (isLoading) return <div>Loading...</div>;
  if (!revenueData || revenueData.length === 0) return <div>No data available</div>;
  
  const productRevenueData = revenueData.map(data => ({
    year: data.year,
    breakdown: data.product_breakdown.map(item => ({
      label: item.product,
      revenue: item.revenue,
      percentage: item.percentage
    }))
  })).sort((a, b) => a.year - b.year)

  // Get unique labels for table headers
  const labels = Array.from(
    new Set(productRevenueData.flatMap(data => data.breakdown.map(item => item.label)))
  )

  return (
    <div className="revenue-charts">
      <Typography variant="h5" sx={{ mb: 2 }}>
          Revenue Breakdown
        </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        All numbers are in billions of USD.
      </Typography>
      <div>
        <RevenueChart revenueData={productRevenueData} />
      </div>
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
                {productRevenueData.map(data => (
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
                  {productRevenueData.map(data => {
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
    </div>
  );
};

export default Revenue;
