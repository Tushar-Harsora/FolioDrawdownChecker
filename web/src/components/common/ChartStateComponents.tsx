import React from 'react';
import { TimePeriod, TIME_PERIOD_OPTIONS } from '@/utils/chartUtils';

interface ChartLoadingStateProps {
  message: string;
  spinnerColor?: string;
}

export const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({ 
  message, 
  spinnerColor = 'border-blue-600 dark:border-blue-400' 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${spinnerColor}`}></div>
          <span className="text-gray-600 dark:text-gray-400">{message}</span>
        </div>
      </div>
    </div>
  );
};

interface ChartErrorStateProps {
  error: string;
}

export const ChartErrorState: React.FC<ChartErrorStateProps> = ({ error }) => {
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
};

interface ChartEmptyStateProps {
  message: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ message }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  focusColor?: string;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange, 
  focusColor = 'focus:ring-blue-500 focus:border-blue-500' 
}) => {
  return (
    <div className="flex-shrink-0">
      <select
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
        className={`px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${focusColor}`}
      >
        {TIME_PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  className = "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6" 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface ChartHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

interface ChartFooterProps {
  message: string;
}

export const ChartFooter: React.FC<ChartFooterProps> = ({ message }) => {
  return (
    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
      {message}
    </div>
  );
};
