import { FinancialData, ReportType } from "../types";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RevenueChart from "./RevenueData";

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
  if (!revenueData) return <div>No data available</div>;
  
  const productRevenueData = revenueData.map(data => ({
    year: data.year,
    breakdown: data.product_breakdown.map(item => ({
      label: item.product,
      revenue: item.revenue,
      percentage: item.percentage
    }))
  }))
  console.log(productRevenueData)

  return (
    <div className="revenue-charts">
      <RevenueChart revenueData={productRevenueData} />
    </div>
  );
};

export default Revenue;
