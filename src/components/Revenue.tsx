import { FinancialData, ReportType } from "../types";

interface RevenueProps {
  financialData: Record<ReportType, FinancialData | null>;
}

const Revenue = ({ financialData }: RevenueProps) => {
  return <div>Revenue</div>;  
};

export default Revenue;
