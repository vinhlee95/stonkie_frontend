import { FinancialData, ReportType } from "../types";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import FinancialChart from './FinancialChart';

interface RevenueProps {
  financialData: Record<ReportType, FinancialData | null>;
}

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
  type: 'product' | 'region';
  breakdown: ProductRevenueBreakdown[] | RegionRevenueBreakdown[];
}

interface RevenueBreakdownDTO {
  year: number;
  revenue_breakdown: RevenueBreakdown[];
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const Revenue = ({ financialData }: RevenueProps) => {
  const [revenueData, setRevenueData] = useState<RevenueBreakdownDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchDataRef = useRef<boolean>(false);
  const { ticker } = useParams();

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (fetchDataRef.current) return;
      fetchDataRef.current = true;
      setIsLoading(true);

      try {
        // TODO: this is still being fetched twice
        const response = await fetch(`${BACKEND_URL}/api/companies/${ticker}/revenue`);
        const data = await response.json();
        setRevenueData(data.data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setIsLoading(false);
        fetchDataRef.current = false;
      }
    };

    fetchRevenueData();
  }, [ticker]);

  console.log("revenue data", revenueData)

  if (isLoading) return <div>Loading...</div>;
  if (!revenueData) return <div>No data available</div>;

  const productData = revenueData.revenue_breakdown.find(b => b.type === 'product')?.breakdown as ProductRevenueBreakdown[];
  const regionData = revenueData.revenue_breakdown.find(b => b.type === 'region')?.breakdown as RegionRevenueBreakdown[];

  const productChartConfig = productData ? {
    title: 'Revenue by Product',
    labels: productData.map(item => item.product || ''),
    datasets: [{
      type: 'bar' as const,
      label: 'Revenue',
      data: productData.map(item => item.revenue),
      backgroundColor: 'rgba(45, 147, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      borderRadius: 4
    }],
  } : null;

  const regionChartConfig = regionData ? {
    title: 'Revenue by Region',
    labels: regionData.map(item => item.region || ''),
    datasets: [{
      type: 'bar' as const,
      label: 'Revenue',
      data: regionData.map(item => item.revenue),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      borderRadius: 4
    }],
  } : null;

  return (
    <div className="revenue-charts">
      {productChartConfig && (
        <FinancialChart 
          {...productChartConfig}
          height={400}
          marginTop={2}
          yAxisConfig={{ formatAsCurrency: true }}
        />
      )}
      {regionChartConfig && (
        <FinancialChart 
          {...regionChartConfig}
          height={400}
          marginTop={4}
          yAxisConfig={{ formatAsCurrency: true }}
        />
      )}
    </div>
  );
};

export default Revenue;
