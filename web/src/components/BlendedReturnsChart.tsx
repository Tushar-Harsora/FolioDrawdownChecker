'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PortfolioFund, HistoricalPricesResponse } from '@/types';
import {
  TimePeriod,
  calculateDateRange,
  getSelectedPeriodDescription,
  getAllUniqueDates,
  sortDateStrings,
  formatDateForDisplay,
  TIME_PERIOD_OPTIONS
} from '@/utils/chartUtils';

interface BlendedReturnsChartProps {
  portfolioFunds: PortfolioFund[];
}

interface BlendedChartDataPoint {
  date: string;
  formattedDate: string;
  investmentValue: number;
  blendedNAV: number;
  returns: number;
  returnsPercentage: number;
}

export default function BlendedReturnsChart({ portfolioFunds }: BlendedReturnsChartProps) {
  const [data, setData] = useState<BlendedChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');

  const calculateBlendedReturns = (fundDataResults: Array<{ fund: PortfolioFund; data: any[] }>) => {
    // Get all unique dates and sort them
    const allDates = getAllUniqueDates(fundDataResults);
    const sortedDates = sortDateStrings(allDates);

    // Calculate total allocation percentage
    const totalAllocation = portfolioFunds.reduce((sum, fund) => sum + fund.percentage, 0);

    if (totalAllocation === 0) {
      return [];
    }

    // Calculate blended NAV for each date
    const blendedData: BlendedChartDataPoint[] = [];
    let initialBlendedNAV: number | null = null;

    for (const date of sortedDates) {
      const [day, month, year] = date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      let blendedNAV = 0;
      let availableFunds = 0;
      let totalWeightForAvailableFunds = 0;

      // Calculate weighted NAV for this date
      fundDataResults.forEach(result => {
        const fundData = result.data.find(price => price.date === date);
        if (fundData && result.fund.percentage > 0) {
          const weight = result.fund.percentage / totalAllocation;
          blendedNAV += fundData.nav * weight;
          availableFunds++;
          totalWeightForAvailableFunds += weight;
        }
      });

      // Only include dates where we have data for at least one fund with allocation
      if (availableFunds > 0 && totalWeightForAvailableFunds > 0) {
        // Normalize the blended NAV if not all funds have data for this date
        if (totalWeightForAvailableFunds < 1) {
          blendedNAV = blendedNAV / totalWeightForAvailableFunds;
        }

        // Set initial blended NAV for the first valid date
        if (initialBlendedNAV === null) {
          initialBlendedNAV = blendedNAV;
        }

        // Calculate investment value based on ₹1000 initial investment
        const investmentValue = initialBlendedNAV > 0 ? (blendedNAV / initialBlendedNAV) * 1000 : 1000;
        const returns = investmentValue - 1000;
        const returnsPercentage = ((investmentValue - 1000) / 1000) * 100;

        blendedData.push({
          date,
          formattedDate: formatDateForDisplay(date),
          investmentValue: Math.round(investmentValue * 100) / 100,
          blendedNAV: Math.round(blendedNAV * 100) / 100,
          returns: Math.round(returns * 100) / 100,
          returnsPercentage: Math.round(returnsPercentage * 100) / 100
        });
      }
    }

    return blendedData;
  };

  useEffect(() => {
    const fetchBlendedReturnsData = async () => {
      if (!portfolioFunds || portfolioFunds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Check if any fund has allocation
      const hasAllocation = portfolioFunds.some(fund => fund.percentage > 0);
      if (!hasAllocation) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const dateRange = calculateDateRange(selectedPeriod);

        // Fetch data for all funds in parallel
        const fetchPromises = portfolioFunds.map(async (portfolioFund) => {
          let url = `/api/v1/mutual-funds/${portfolioFund.fund.schemeCode}/historical-prices/range`;

          if (dateRange) {
            url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          }

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

        const results = await Promise.all(fetchPromises);

        // Check if any fund has data
        const hasData = results.some(result => result.data.length > 0);
        if (!hasData) {
          setError('No historical data available for selected funds');
          setData([]);
          return;
        }

        // Calculate blended returns
        const blendedData = calculateBlendedReturns(results);

        if (blendedData.length === 0) {
          setError('Unable to calculate blended returns with current allocation');
          setData([]);
          return;
        }

        setData(blendedData);
      } catch (err) {
        console.error('Error fetching blended returns data:', err);
        setError('Failed to load blended returns data. Please try again later.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlendedReturnsData();
  }, [portfolioFunds, selectedPeriod]);

  // Don't render if no funds or no allocation
  const totalAllocation = portfolioFunds.reduce((sum, fund) => sum + fund.percentage, 0);
  if (portfolioFunds.length === 0 || totalAllocation === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 dark:border-green-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Calculating blended returns...</span>
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
            <p className="text-gray-600 dark:text-gray-400">No blended returns data available</p>
          </div>
        </div>
      </div>
    );
  }

  const latestData = data[data.length - 1];
  const isPositiveReturns = latestData.returns >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Blended Returns Chart
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Growth of ₹1,000 investment - {getSelectedPeriodDescription(selectedPeriod)}
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current Value: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{latestData.investmentValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Returns: </span>
                <span className={`font-semibold ${isPositiveReturns ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositiveReturns ? '+' : ''}₹{latestData.returns.toLocaleString('en-IN')} ({isPositiveReturns ? '+' : ''}{latestData.returnsPercentage}%)
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              domain={['dataMin - 50', 'dataMax + 50']}
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '6px',
                color: 'var(--tooltip-text)'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'investmentValue') {
                  return [`₹${value.toLocaleString('en-IN')}`, 'Investment Value'];
                }
                return [value, name];
              }}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="investmentValue"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#10B981' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Simulated returns based on portfolio allocation and historical NAV data
      </div>
    </div>
  );
}
