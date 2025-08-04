'use client';

import { PortfolioFund, InvestmentDetails } from '@/types';

interface ValidationDisplayProps {
  portfolioFunds: PortfolioFund[];
  onSubmit: () => void;
  investment?: InvestmentDetails | null;
}

export default function ValidationDisplay({ portfolioFunds, onSubmit, investment }: ValidationDisplayProps) {
  const totalPercentage = portfolioFunds.reduce((sum, fund) => sum + fund.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01; // Allow for floating point precision
  const hasAnyFunds = portfolioFunds.length > 0;
  const hasAllPercentages = portfolioFunds.every(fund => fund.percentage > 0);
  const hasInvestmentDetails = investment && investment.amount > 0 && investment.date;

  const calculateFundAmount = (percentage: number) => {
    if (!investment || investment.amount <= 0) return 0;
    return (investment.amount * percentage) / 100;
  };

  const getValidationMessage = () => {
    if (!hasAnyFunds) {
      return { message: 'Add funds to your portfolio to get started', type: 'info' };
    }

    if (!hasAllPercentages) {
      return { message: 'Please set allocation percentages for all funds', type: 'warning' };
    }

    if (totalPercentage < 100) {
      const remaining = 100 - totalPercentage;
      return {
        message: `Portfolio is ${remaining.toFixed(1)}% under-allocated`,
        type: 'warning'
      };
    }

    if (totalPercentage > 100) {
      const excess = totalPercentage - 100;
      return {
        message: `Portfolio is ${excess.toFixed(1)}% over-allocated`,
        type: 'error'
      };
    }

    return { message: 'Portfolio allocation is perfect!', type: 'success' };
  };

  const validation = getValidationMessage();

  const getProgressBarColor = () => {
    if (totalPercentage === 0) return 'bg-gray-300 dark:bg-gray-600';
    if (totalPercentage < 100) return 'bg-yellow-500 dark:bg-yellow-400';
    if (totalPercentage > 100) return 'bg-red-500 dark:bg-red-400';
    return 'bg-green-500 dark:bg-green-400';
  };

  const getMessageColor = () => {
    switch (validation.type) {
      case 'success': return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'info': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Allocation</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>0%</span>
          <span className="font-medium">Target: 100%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Validation Message */}
      <div className={`border rounded-lg p-4 ${getMessageColor()}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {validation.type === 'success' && (
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {validation.type === 'warning' && (
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {validation.type === 'error' && (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {validation.type === 'info' && (
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{validation.message}</p>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      {hasInvestmentDetails && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Investment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Investment Mode</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {investment.mode}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {investment.mode === 'Lumpsum' ? 'Total Amount' : 'Monthly Amount'}
              </div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                ₹{investment.amount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {investment.mode === 'Lumpsum' ? 'Investment Date' : 'SIP Start Date'}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(investment.date).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fund Breakdown */}
      {hasAnyFunds && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Allocation Breakdown</h4>
          <div className="space-y-2">
            {portfolioFunds.map((fund) => (
              <div key={fund.fund.schemeCode} className="flex justify-between items-center py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {fund.fund.schemeName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Scheme Code: {fund.fund.schemeCode}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fund.percentage.toFixed(1)}%
                  </div>
                  {hasInvestmentDetails && fund.percentage > 0 && (
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ₹{calculateFundAmount(fund.percentage).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Total</div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-bold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {totalPercentage.toFixed(1)}%
                  </div>
                  {hasInvestmentDetails && isValid && (
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      ₹{investment.amount.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!isValid || !hasAnyFunds}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isValid && hasAnyFunds
              ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {!hasAnyFunds ? 'Add Funds to Continue' : !isValid ? 'Fix Allocation to Submit' : 'Submit Portfolio'}
        </button>
      </div>
    </div>
  );
}
