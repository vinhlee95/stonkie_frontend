import { RevenueData } from "../types";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RevenueChart from "./revenue/RevenueChart";
import RevenueTable from "./revenue/RevenueTable";
import { Typography } from '@mui/material';
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

const Revenue = () => {
  const { ticker } = useParams();
  const {data: revenueData, error, isLoading} = useQuery({
    queryKey: ['revenue', ticker],
    queryFn: () => fetchRevenueData(ticker),
    staleTime: 1000 * 60 * 5, // cache the data for 5 minutes
  })

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
