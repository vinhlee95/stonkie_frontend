import { RevenueData, RevenueInsight } from "../types";
import { useParams } from "react-router-dom";
import RevenueChart from "./revenue/RevenueChart";
import RevenueTable from "./revenue/RevenueTable";
import RevenueInsights from "./revenue/RevenueInsights";
import { Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const fetchRevenueData = async (ticker: string | undefined) => {
  if(!ticker) {
    throw new Error('Ticker is required')
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/revenue`)
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
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const insights: RevenueInsight[] = [];
    
    if (!reader) throw new Error('Failed to get response reader');

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          const parsed = JSON.parse(data);
          
          if (parsed.status === 'error') {
            throw new Error(parsed.error);
          }
          
          if (parsed.status === 'success' && parsed.data) {
            insights.push(parsed.data);
          }
          // Handle streaming updates if needed
          if (parsed.status === 'streaming') {
            console.log('Streaming update:', parsed.content);
          }
        }
      }
    }
    
    return insights;
  } catch (error) {
    console.error('Error fetching revenue insights:', error);
    throw error;
  }
}

const Revenue = () => {
  const { ticker } = useParams();
  const {data: revenueData, isLoading: isLoadingRevenue} = useQuery({
    queryKey: ['revenue', ticker],
    queryFn: () => fetchRevenueData(ticker),
    staleTime: 1000 * 60 * 5, // cache the data for 5 minutes
  })

  const {data: revenueInsightData, isLoading: isLoadingInsights} = useQuery({
    queryKey: ['revenue_insights', ticker],
    queryFn: () => fetchRevenueInsights(ticker),
    staleTime: 1000 * 60 * 60, // cache the data for 1 hour
    enabled: !!revenueData, // Only start fetching insights after revenue data is loaded
  })

  if(isLoadingRevenue) return <CircularProgress size={24} color="inherit" />
  
  if (!revenueData || revenueData.length === 0) return <div>No data available</div>;

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
        By product category
      </Typography>
      <RevenueInsights insights={revenueInsightData?.filter(item => item.type === 'product')} isLoading={isLoadingInsights} />
      <Box sx={{ mt: 4 }}>
        <RevenueChart revenueData={productRevenueData} />
      </Box>
      <Box sx={{ mt: 4 }}>
        <RevenueTable revenueData={productRevenueData} />
      </Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
        By geographic
      </Typography>
      <RevenueInsights insights={revenueInsightData?.filter(item => item.type === 'region')} isLoading={isLoadingInsights} />
      <Box sx={{ mt: 4 }}>
        <RevenueChart revenueData={regionRevenueData} />
      </Box>
      <Box sx={{ mt: 4 }}>
        <RevenueTable revenueData={regionRevenueData} />
      </Box>
    </div>
  );
};

export default Revenue;
