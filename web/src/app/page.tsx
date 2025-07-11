'use client';

import { useState } from 'react';
import { MutualFund, PortfolioFund } from '@/types';
import FundSearch from '@/components/FundSearch';
import PortfolioManager from '@/components/PortfolioManager';
import ValidationDisplay from '@/components/ValidationDisplay';
import ThemeToggle from '@/components/ThemeToggle';
import HistoricalPriceChart from '@/components/HistoricalPriceChart';

export default function Home() {
  const [portfolioFunds, setPortfolioFunds] = useState<PortfolioFund[]>([]);

  const handleFundSelect = (fund: MutualFund) => {
    // Check if fund is already in portfolio
    const existingFund = portfolioFunds.find(pf => pf.fund.schemeCode === fund.schemeCode);
    if (existingFund) {
      return; // Fund already exists, do nothing
    }

    // Add new fund with 0% allocation
    const newPortfolioFund: PortfolioFund = {
      fund,
      percentage: 0
    };

    setPortfolioFunds(prev => [...prev, newPortfolioFund]);
  };

  const handleUpdatePercentage = (schemeCode: number, percentage: number) => {
    setPortfolioFunds(prev =>
      prev.map(pf =>
        pf.fund.schemeCode === schemeCode
          ? { ...pf, percentage }
          : pf
      )
    );
  };

  const handleRemoveFund = (schemeCode: number) => {
    setPortfolioFunds(prev => prev.filter(pf => pf.fund.schemeCode !== schemeCode));
  };

  const handleSubmit = () => {
    // Placeholder submit functionality
    const portfolioData = {
      funds: portfolioFunds.map(pf => ({
        schemeCode: pf.fund.schemeCode,
        schemeName: pf.fund.schemeName,
        percentage: pf.percentage
      })),
      totalPercentage: portfolioFunds.reduce((sum, pf) => sum + pf.percentage, 0),
      timestamp: new Date().toISOString()
    };

    console.log('Portfolio submitted:', portfolioData);
    alert('Portfolio submitted successfully! Check the console for details.');
  };

  const selectedFunds = portfolioFunds.map(pf => pf.fund);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Mutual Fund Portfolio Builder
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Create your personalized mutual fund portfolio with precise allocation
              </p>
            </div>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Search and Portfolio Management */}
          <div className="space-y-8">
            {/* Search Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Mutual Funds
              </h2>
              <FundSearch 
                onFundSelect={handleFundSelect}
                selectedFunds={selectedFunds}
              />
            </div>

            {/* Portfolio Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <PortfolioManager
                portfolioFunds={portfolioFunds}
                onUpdatePercentage={handleUpdatePercentage}
                onRemoveFund={handleRemoveFund}
              />
            </div>
          </div>

          {/* Right Column - Validation and Summary */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Portfolio Summary
              </h2>
              <ValidationDisplay
                portfolioFunds={portfolioFunds}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>

        {/* Historical Price Chart Section - Full Width */}
        {portfolioFunds.length > 0 && (
          <div className="mt-8">
            <HistoricalPriceChart fund={portfolioFunds[0].fund} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky top-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Built with Next.js, React, and Tailwind CSS</p>
            <p className="mt-1">Portfolio allocation tool for educational purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
