import { RevenueData } from "../types";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RevenueChart from "./RevenueData";
import RevenueTable from "./RevenueTable";
import { Typography } from '@mui/material';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const Revenue = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
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
        const { data }: { data: RevenueData[] } = await response.json();
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
      <RevenueChart revenueData={productRevenueData} />
      <RevenueTable revenueData={productRevenueData} />
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
        Region Breakdown
      </Typography>
      <RevenueChart revenueData={regionRevenueData} />
      <RevenueTable revenueData={regionRevenueData} />
    </div>
  );
};

export default Revenue;
