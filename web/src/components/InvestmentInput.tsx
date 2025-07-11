'use client';

import { InvestmentMode, InvestmentDetails } from '@/types';

interface InvestmentInputProps {
  investment: InvestmentDetails | null;
  onInvestmentChange: (investment: InvestmentDetails | null) => void;
  totalPercentage: number;
}

export default function InvestmentInput({ 
  investment, 
  onInvestmentChange, 
  totalPercentage 
}: InvestmentInputProps) {
  const handleModeChange = (mode: InvestmentMode) => {
    const today = new Date().toISOString().split('T')[0];
    onInvestmentChange({
      mode,
      amount: investment?.amount || 0,
      date: investment?.date || today
    });
  };

  const handleAmountChange = (amount: number) => {
    if (investment) {
      onInvestmentChange({
        ...investment,
        amount
      });
    }
  };

  const handleDateChange = (date: string) => {
    if (investment) {
      onInvestmentChange({
        ...investment,
        date
      });
    }
  };

  const isValid = investment && investment.amount > 0 && investment.date && totalPercentage === 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Investment Details
      </h3>
      
      {/* Investment Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Investment Mode
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="investmentMode"
              value="Lumpsum"
              checked={investment?.mode === 'Lumpsum'}
              onChange={() => handleModeChange('Lumpsum')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-900 dark:text-white">Lumpsum</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="investmentMode"
              value="SIP"
              checked={investment?.mode === 'SIP'}
              onChange={() => handleModeChange('SIP')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-900 dark:text-white">SIP</span>
          </label>
        </div>
      </div>

      {/* Investment Inputs */}
      {investment && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {investment.mode === 'Lumpsum' ? 'Investment Amount' : 'Monthly SIP Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={investment.amount || ''}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {investment.mode === 'Lumpsum' ? 'Investment Date' : 'SIP Start Date'}
            </label>
            <input
              id="date"
              type="date"
              value={investment.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Validation Message */}
      {investment && (
        <div className="mt-4">
          {totalPercentage !== 100 ? (
            <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              Please ensure portfolio allocation totals 100% before proceeding with investment.
            </div>
          ) : investment.amount <= 0 ? (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              Please enter a valid investment amount.
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}
