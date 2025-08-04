'use client';

import { PortfolioFund, InvestmentDetails } from '@/types';
import InvestmentInput from './InvestmentInput';

interface PortfolioManagerProps {
  portfolioFunds: PortfolioFund[];
  onUpdatePercentage: (schemeCode: number, percentage: number) => void;
  onRemoveFund: (schemeCode: number) => void;
  investment: InvestmentDetails | null;
  onInvestmentChange: (investment: InvestmentDetails | null) => void;
}

export default function PortfolioManager({
  portfolioFunds,
  onUpdatePercentage,
  onRemoveFund,
  investment,
  onInvestmentChange
}: PortfolioManagerProps) {
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'Moderate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const totalPercentage = portfolioFunds.reduce((sum, fund) => sum + fund.percentage, 0);

  const calculateFundAmount = (percentage: number) => {
    if (!investment || investment.amount <= 0) return 0;
    return (investment.amount * percentage) / 100;
  };

  const handlePercentageChange = (schemeCode: number, value: string) => {
    const percentage = parseFloat(value) || 0;
    if (percentage >= 0 && percentage <= 100) {
      onUpdatePercentage(schemeCode, percentage);
    }
  };

  if (portfolioFunds.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No funds selected yet</div>
        <div className="text-gray-400 dark:text-gray-500 text-sm">
          Search and select mutual funds to build your portfolio
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Investment Input Section */}
      <InvestmentInput
        investment={investment}
        onInvestmentChange={onInvestmentChange}
        totalPercentage={totalPercentage}
      />

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Selected Funds ({portfolioFunds.length})
      </h3>

      <div className="space-y-3">
        {portfolioFunds.map((portfolioFund) => (
          <div
            key={portfolioFund.fund.schemeCode}
            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {portfolioFund.fund.schemeName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Scheme Code: {portfolioFund.fund.schemeCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`percentage-${portfolioFund.fund.schemeCode}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allocation:
                      </label>
                      <div className="relative">
                        <input
                          id={`percentage-${portfolioFund.fund.schemeCode}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={portfolioFund.percentage || ''}
                          onChange={(e) => handlePercentageChange(portfolioFund.fund.schemeCode, e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                          placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Calculated Amount Display */}
                    {investment && investment.amount > 0 && portfolioFund.percentage > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount:</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{calculateFundAmount(portfolioFund.percentage).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onRemoveFund(portfolioFund.fund.schemeCode)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove fund"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-friendly table view for smaller screens */}
      <div className="md:hidden mt-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white">Portfolio Summary</h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {portfolioFunds.map((portfolioFund) => (
              <div key={portfolioFund.fund.schemeCode} className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {portfolioFund.fund.schemeName}
                  </div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {portfolioFund.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
