'use client';

import { useState, useEffect, useCallback } from 'react';
import { PortfolioFund } from '@/types';

const STORAGE_KEY = 'savvy-calc-portfolio';

export function usePersistedPortfolio() {
  const [portfolioFunds, setPortfolioFunds] = useState<PortfolioFund[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load portfolio from localStorage on mount
  useEffect(() => {
    try {
      const savedPortfolio = localStorage.getItem(STORAGE_KEY);
      if (savedPortfolio) {
        const parsedPortfolio = JSON.parse(savedPortfolio);
        // Validate the data structure
        if (Array.isArray(parsedPortfolio)) {
          setPortfolioFunds(parsedPortfolio);
        }
      }
    } catch (error) {
      console.warn('Failed to load portfolio from localStorage:', error);
      // Continue with empty portfolio if loading fails
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioFunds));
    } catch (error) {
      console.warn('Failed to save portfolio to localStorage:', error);
    }
  }, [portfolioFunds, isLoaded]);

  // Wrapper function to update portfolio funds
  const updatePortfolioFunds = useCallback((updater: PortfolioFund[] | ((prev: PortfolioFund[]) => PortfolioFund[])) => {
    setPortfolioFunds(updater);
  }, []);

  return {
    portfolioFunds,
    setPortfolioFunds: updatePortfolioFunds,
    isLoaded
  };
}
