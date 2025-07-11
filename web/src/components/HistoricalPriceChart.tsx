'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MutualFund, HistoricalPricesResponse } from '@/types';

type TimePeriod = '3M' | '1Y' | '3Y' | '5Y' | 'ALL';

interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  description: string;
}

const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { value: '3M', label: '3M', description: 'Last 3 Months' },
  { value: '1Y', label: '1Y', description: 'Last 1 Year' },
  { value: '3Y', label: '3Y', description: 'Last 3 Years' },
  { value: '5Y', label: '5Y', description: 'Last 5 Years' },
  { value: 'ALL', label: 'All', description: 'All Time' },
];

interface HistoricalPriceChartProps {
  fund: MutualFund;
}

interface ChartDataPoint {
  date: string;
  nav: number;
  formattedDate: string;
}

export default function HistoricalPriceChart({ fund }: HistoricalPriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');

  const calculateDateRange = (period: TimePeriod) => {
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

  const getSelectedPeriodDescription = () => {
    const option = TIME_PERIOD_OPTIONS.find(opt => opt.value === selectedPeriod);
    return option?.description || 'Last 1 Year';
  };

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!fund) return;

      setLoading(true);
      setError(null);

      try {
        const dateRange = calculateDateRange(selectedPeriod);
        
        let url = `/api/v1/mutual-funds/${fund.schemeCode}/historical-prices/range`;
        
        if (dateRange) {
          url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const result: HistoricalPricesResponse = await response.json();

        if (!result.historicalPrices || result.historicalPrices.length === 0) {
          setError('No historical data available for this fund');
          setData([]);
          return;
        }

        // Transform data for chart
        const chartData: ChartDataPoint[] = result.historicalPrices
          .map(price => {
            // Convert DD-MM-YYYY to Date object for sorting
            const [day, month, year] = price.date.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            return {
              date: price.date,
              nav: price.nav,
              formattedDate: dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              }),
              sortDate: dateObj.getTime()
            };
          })
          .sort((a, b) => (a as any).sortDate - (b as any).sortDate) // Sort by date ascending
          .map(({ sortDate, ...rest }) => rest); // Remove sortDate from final data

        setData(chartData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load historical data. Please try again later.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [fund, selectedPeriod]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading historical data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">No historical data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Historical Performance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {fund.schemeName} - {getSelectedPeriodDescription()}
            </p>
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TIME_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-600" 
            />
            <XAxis 
              dataKey="formattedDate"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '6px',
                color: 'var(--tooltip-text)'
              }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'NAV']}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="nav"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Data shows Net Asset Value (NAV) over the selected period
      </div>
    </div>
  );
}
