import { RevenueData, RevenueInsight } from "../types";
import { useParams } from "react-router-dom";
import RevenueChart from "./revenue/RevenueChart";
import RevenueTable from "./revenue/RevenueTable";
import { Typography, Box, Paper } from '@mui/material';
import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const fetchRevenueData = async (ticker: string | undefined) => {
  if(!ticker) {
    throw new Error('Ticker is required')
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/revenue`);
    const { data }: { data: RevenueData[] } = await response.json();
    return data
  } catch (error) {
    console.error('Error fetching revenue data:', error);
  }
}

const fetchRevenueInsights = async (ticker: string | undefined) => {
  if(!ticker) {
    throw new Error('Ticker is required')
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/revenue/insights`);
    const { data }: { data: RevenueInsight[] } = await response.json();
    return data
  } catch (error) {
    console.error('Error fetching revenue data:', error);
  }
}

const Revenue = () => {
  const { ticker } = useParams();
  const {data: revenueData} = useQuery({
    queryKey: ['revenue', ticker],
    queryFn: () => fetchRevenueData(ticker),
    staleTime: 1000 * 60 * 5, // cache the data for 5 minutes
  })

  const {data: revenueInsightData} = useQuery({
    queryKey: ['revenue_insights', ticker],
    queryFn: () => fetchRevenueInsights(ticker),
    staleTime: 1000 * 60 * 60, // cache the data for 1 hour
  })
  
  if (!revenueData || revenueData.length === 0) return <div>No data available</div>;

  const renderInsights = (insights: RevenueInsight[] | undefined) => {
    if(!insights) return null
    return (
      <div>
        <Typography variant="h6" sx={{ mb: 2 }}>
        💡 Insights
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            scrollBehavior: 'smooth',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 8,
              width: '60px',
              background: 'linear-gradient(to right, transparent, background.paper)',
              pointerEvents: 'none',
              zIndex: 1
            },
            '::-webkit-scrollbar': {
              height: 8,
              bgcolor: 'background.paper',
              borderRadius: 4,
            },
            '::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.400',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'grey.500'
              }
            },
            '::-webkit-scrollbar-track': {
              bgcolor: 'grey.100',
              borderRadius: 4
            },
            mx: -2, // Negative margin to allow full-width scrolling
            px: 2, // Padding to offset negative margin
          }}
        >
          {insights.map((item, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                minWidth: '300px',
                maxWidth: '400px',
                flex: '0 0 auto',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <Typography variant="body1">
                {item.insight}
              </Typography>
            </Paper>
          ))}
        </Box>
      </div>
    )
  }
  
  const productRevenueData = revenueData.map(data => ({
    year: data.year,
    breakdown: data.product_breakdown.map(item => ({
      label: item.product,
      revenue: item.revenue,
      percentage: item.percentage
    }))
  })).sort((a, b) => a.year - b.year)

  const regionRevenueData = revenueData.map(data => ({
    year: data.year,
    breakdown: data.region_breakdown.map(item => ({
      label: item.region,
      revenue: item.revenue,
      percentage: item.percentage
    }))
  })).sort((a, b) => a.year - b.year)

  return (
    <div className="revenue-charts">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Revenue Breakdown
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        All numbers are in billions of USD.
      </Typography>
      {renderInsights(revenueInsightData?.filter(item => item.type === 'product'))}
      <RevenueChart revenueData={productRevenueData} />
      <RevenueTable revenueData={productRevenueData} />
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
        Region Breakdown
      </Typography>
      {renderInsights(revenueInsightData?.filter(item => item.type === 'region'))}
      <RevenueChart revenueData={regionRevenueData} />
      <RevenueTable revenueData={regionRevenueData} />
    </div>
  );
};

export default Revenue;
