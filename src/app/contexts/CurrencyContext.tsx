import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Currency = 'MXN' | 'EUR' | 'USD';

interface CurrencyOption {
  code: Currency;
  label: string;
  symbol: string;
  rateFromMXN: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencyOptions: CurrencyOption[];
  convertPrice: (amountMXN: number) => number;
  formatPrice: (amountMXN: number, decimals?: number) => string;
}

const CURRENCY_OPTIONS: Record<Currency, CurrencyOption> = {
  MXN: {
    code: 'MXN',
    label: 'Pesos Mexicanos',
    symbol: 'MX$',
    rateFromMXN: 1,
  },
  EUR: {
    code: 'EUR',
    label: 'Euros',
    symbol: '€',
    rateFromMXN: 0.05,
  },
  USD: {
    code: 'USD',
    label: 'Dolares',
    symbol: 'US$',
    rateFromMXN: 0.058,
  },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('MXN');

  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency');
    if (storedCurrency === 'MXN' || storedCurrency === 'EUR' || storedCurrency === 'USD') {
      setCurrency(storedCurrency);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const currencyOptions = useMemo(() => Object.values(CURRENCY_OPTIONS), []);

  const convertPrice = useCallback((amountMXN: number): number => {
    const rate = CURRENCY_OPTIONS[currency].rateFromMXN;
    return amountMXN * rate;
  }, [currency]);

  const formatPrice = useCallback((amountMXN: number, decimals = 2): string => {
    const converted = convertPrice(amountMXN);
    const formattedAmount = new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(converted);

    return `${CURRENCY_OPTIONS[currency].symbol}${formattedAmount}`;
  }, [convertPrice, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencyOptions, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
