export interface FinancialData {
  data: Record<string, string | number>[];
  columns: string[];
}

export interface FinancialResponse {
  data: FinancialData;
  error?: string;
}

export type ReportType = 'income_statement' | 'balance_sheet' | 'cash_flow';

export interface ProductRevenueBreakdown {
  product: string;
  revenue: number;
  percentage: number;
}

export interface RegionRevenueBreakdown {
  region: string;
  revenue: number;
  percentage: number;
}

export interface RevenueData {
  year: number;
  product_breakdown: ProductRevenueBreakdown[];
  region_breakdown: RegionRevenueBreakdown[];
}