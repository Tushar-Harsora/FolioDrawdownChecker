export interface MutualFund {
  schemeCode: number;
  schemeName: string;
}

export interface PortfolioFund {
  fund: MutualFund;
  percentage: number;
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
