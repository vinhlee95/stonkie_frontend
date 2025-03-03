import { RevenueData } from "../types";
import { useParams } from "react-router-dom";
import RevenueChart from "./revenue/RevenueChart";
import RevenueTable from "./revenue/RevenueTable";
import RevenueInsights from "./revenue/RevenueInsights";
import { Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';

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

const createInsightStream = (
  url: string,
  onInsight: (content: string) => void
) => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        resolve(null);
        return;
      }

      const data = JSON.parse(event.data);
      
      if (data.status === 'error') {
        eventSource.close();
        reject(new Error(data.error));
        return;
      }

      if (data.status === 'success' && data.data?.content) {
        onInsight(data.data.content);
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
      reject(error);
    };

    // Cleanup function
    return () => {
      eventSource.close();
    };
  });
};

const Revenue = () => {
  const { ticker } = useParams();
  const [productInsights, setProductInsights] = useState<string[]>([]);
  const [regionInsights, setRegionInsights] = useState<string[]>([]);

  const {data: revenueData, isLoading: isLoadingRevenue} = useQuery({
    queryKey: ['revenue', ticker],
    queryFn: () => fetchRevenueData(ticker),
  });

  useQuery({
    queryKey: ['revenue-insights', ticker],
    queryFn: () => {
      if (!ticker || !revenueData) return null;
      
      setProductInsights([]); // Reset insights when query starts
      
      return createInsightStream(
        `${BACKEND_URL}/api/companies/${ticker}/revenue/insights/product`,
        (content) => setProductInsights(prev => [...prev, content])
      );
    },
    enabled: Boolean(ticker && revenueData),
    refetchOnWindowFocus: false,
    retry: false
  });

  useQuery({
    queryKey: ['region-insights', ticker],
    queryFn: () => {
      if (!ticker || !revenueData) return null;
      
      setRegionInsights([]); // Reset insights when query starts
      
      return createInsightStream(
        `${BACKEND_URL}/api/companies/${ticker}/revenue/insights/region`,
        (content) => setRegionInsights(prev => [...prev, content])
      );
    },
    enabled: Boolean(ticker && revenueData) && productInsights.length > 0,
    refetchOnWindowFocus: false,
    retry: false
  });

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
      <RevenueInsights insights={productInsights} />
      <Box sx={{ mt: 4 }}>
        <RevenueChart revenueData={productRevenueData} />
      </Box>
      <Box sx={{ mt: 4 }}>
        <RevenueTable revenueData={productRevenueData} />
      </Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
        By geographic
      </Typography>
      <RevenueInsights insights={regionInsights} />
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
