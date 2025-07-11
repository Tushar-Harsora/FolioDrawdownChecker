export interface MutualFund {
  schemeCode: number;
  schemeName: string;
}

export type InvestmentMode = 'Lumpsum' | 'SIP';

export interface InvestmentDetails {
  mode: InvestmentMode;
  amount: number;
  date: string; // For lumpsum: investment date, For SIP: start date
}

export interface PortfolioFund {
  fund: MutualFund;
  percentage: number;
  investment?: InvestmentDetails; // Optional for backward compatibility
}

export interface Portfolio {
  funds: PortfolioFund[];
  totalPercentage: number;
}

export interface ApiSearchResponse {
  data: MutualFund[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface SearchResponse {
  funds: MutualFund[];
  total: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface HistoricalPrice {
  date: string; // Format: "DD-MM-YYYY"
  nav: number;
}

export interface HistoricalPricesResponse {
  fundId: string;
  fundName: string;
  historicalPrices: HistoricalPrice[];
}
