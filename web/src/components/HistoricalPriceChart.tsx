'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MutualFund, HistoricalPricesResponse } from '@/types';
import { 
  TimePeriod, 
  calculateDateRange, 
  getSelectedPeriodDescription, 
  fetchFundHistoricalData,
  getAllUniqueDates,
  sortDateStrings,
  formatDateForDisplay,
  truncateFundName,
} from '@/utils/chartUtils';
import { 
  ChartLoadingState, 
  ChartErrorState, 
  ChartEmptyState, 
  TimePeriodSelector,
  ChartContainer,
  ChartHeader,
  ChartFooter
} from '@/components/common/ChartStateComponents';
import {
  CHART_COLORS,
  CHART_FOCUS_COLORS,
  SPINNER_COLORS
} from '@/utils/chartConfig';

interface HistoricalPriceChartProps {
  funds: MutualFund[];
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  [fundName: string]: string | number; // Dynamic fund data
}

export default function HistoricalPriceChart({ funds }: HistoricalPriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!funds || funds.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const dateRange = calculateDateRange(selectedPeriod);
        const results = await fetchFundHistoricalData(funds, dateRange);
        
        // Check if any fund has data
        const hasData = results.some(result => result.data.length > 0);
        if (!hasData) {
          setError('No historical data available for any selected funds');
          setData([]);
          return;
        }

        // Get all unique dates and sort them
        const allDates = getAllUniqueDates(results);
        const sortedDates = sortDateStrings(allDates);

        // Transform data for chart - combine all funds
        const chartData: ChartDataPoint[] = sortedDates.map(date => {
          const dataPoint: ChartDataPoint = {
            date,
            formattedDate: formatDateForDisplay(date)
          };

          // Add NAV data for each fund
          results.forEach(result => {
            const fundData = result.data.find(price => price.date === date);
            const fundKey = truncateFundName(result.fund.schemeName);
            
            if (fundData) {
              dataPoint[fundKey] = fundData.nav;
            }
          });

          return dataPoint;
        });

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
  }, [funds, selectedPeriod]);

  if (loading) {
    return <ChartLoadingState message="Loading historical data..." spinnerColor={SPINNER_COLORS.blue} />;
  }

  if (error) {
    return <ChartErrorState error={error} />;
  }

  if (data.length === 0) {
    return <ChartEmptyState message="No historical data available" />;
  }

  return (
    <ChartContainer>
      <ChartHeader 
        title="Historical NAV Chart"
        subtitle={`Portfolio Comparison - ${getSelectedPeriodDescription(selectedPeriod)}`}
      >
        <TimePeriodSelector 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          focusColor={CHART_FOCUS_COLORS.blue}
        />
      </ChartHeader>
      
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
              formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name]}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            {funds.map((fund, index) => {
              const fundKey = fund.schemeName.length > 30 
                ? fund.schemeName.substring(0, 30) + '...' 
                : fund.schemeName;
              const color = CHART_COLORS[index % CHART_COLORS.length];
              
              return (
                <Line
                  key={fund.schemeCode}
                  type="monotone"
                  dataKey={fundKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <ChartFooter message="Data shows Net Asset Value (NAV) over the selected period" />
    </ChartContainer>
  );
}
