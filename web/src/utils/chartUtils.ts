import { MutualFund, PortfolioFund, HistoricalPricesResponse } from '@/types';

export type TimePeriod = '3M' | '1Y' | '3Y' | '5Y' | 'ALL';

export interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  description: string;
}

export const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { value: '3M', label: '3M', description: 'Last 3 Months' },
  { value: '1Y', label: '1Y', description: 'Last 1 Year' },
  { value: '3Y', label: '3Y', description: 'Last 3 Years' },
  { value: '5Y', label: '5Y', description: 'Last 5 Years' },
  { value: 'ALL', label: 'All', description: 'All Time' },
];

export const calculateDateRange = (period: TimePeriod) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '3Y':
      startDate.setFullYear(endDate.getFullYear() - 3);
      break;
    case '5Y':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case 'ALL':
      startDate.setFullYear(1970); // No date range for all time
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export const getSelectedPeriodDescription = (period: TimePeriod) => {
  const option = TIME_PERIOD_OPTIONS.find(opt => opt.value === period);
  return option?.description || 'Last 1 Year';
};

export const sortDateStrings = (dates: string[]) => {
  return dates.sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('-');
    const [dayB, monthB, yearB] = b.split('-');
    const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
    const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
    return dateA.getTime() - dateB.getTime();
  });
};

export const formatDateForDisplay = (dateString: string) => {
  const [day, month, year] = dateString.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const parseDateString = (dateString: string): Date => {
  const [day, month, year] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export const buildHistoricalPricesUrl = (schemeCode: number, dateRange?: { startDate: string; endDate: string }) => {
  let url = `/api/v1/mutual-funds/${schemeCode}/historical-prices/range`;
  
  if (dateRange) {
    url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
  }
  
  return url;
};

export const fetchFundHistoricalData = async (
  funds: MutualFund[],
  dateRange: { startDate: string; endDate: string } | null
) => {
  const fetchPromises = funds.map(async (fund) => {
    const url = buildHistoricalPricesUrl(fund.schemeCode, dateRange || undefined);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${fund.schemeName}: ${response.status}`);
    }

    const result: HistoricalPricesResponse = await response.json();
    return {
      fund,
      data: result.historicalPrices || []
    };
  });

  return Promise.all(fetchPromises);
};

export const fetchPortfolioFundHistoricalData = async (
  portfolioFunds: PortfolioFund[],
  dateRange: { startDate: string; endDate: string } | null
) => {
  const fetchPromises = portfolioFunds.map(async (portfolioFund) => {
    const url = buildHistoricalPricesUrl(portfolioFund.fund.schemeCode, dateRange || undefined);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${portfolioFund.fund.schemeName}: ${response.status}`);
    }

    const result: HistoricalPricesResponse = await response.json();
    return {
      fund: portfolioFund,
      data: result.historicalPrices || []
    };
  });

  return Promise.all(fetchPromises);
};

export const getAllUniqueDates = (results: Array<{ data: any[] }>) => {
  const allDates = new Set<string>();
  results.forEach(result => {
    result.data.forEach(price => allDates.add(price.date));
  });
  return Array.from(allDates);
};

export const truncateFundName = (fundName: string, maxLength: number = 30) => {
  return fundName.length > maxLength 
    ? fundName.substring(0, maxLength) + '...' 
    : fundName;
};
