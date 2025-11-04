// Utility functions for Dashboard

import {
  MOCK_TICKERS,
  TRADE_ACTIONS,
  MOCK_NOTES,
} from '../constants/dashboard';

/**
 * Randomly select an item from an array
 * @template T - Type of array elements
 * @param array - Array to select from
 * @returns Randomly selected item
 */
const getRandomItem = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate a random mock trade for demo purposes
 * @returns Trade object with random ticker, action, quantity, price, and notes
 */
export const generateRandomTrade = () => {
  const randomTicker = getRandomItem(MOCK_TICKERS);
  const randomAction = getRandomItem(TRADE_ACTIONS);
  const randomQuantity = Math.floor(Math.random() * 200) + 10;
  const randomPrice = Math.random() * 500 + 50;
  const randomNote =
    Math.random() > 0.5 ? getRandomItem(MOCK_NOTES) : undefined;

  return {
    id: Date.now(),
    ticker: randomTicker,
    action: randomAction,
    quantity: randomQuantity,
    price: parseFloat(randomPrice.toFixed(2)),
    timestamp: new Date().toISOString(),
    traderName: 'Master Trader',
    traderAvatar: '👤',
    notes: randomNote,
    comments: [],
  };
};

/**
 * Format a timestamp as relative time (e.g., "5m ago", "2h ago")
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted relative time string
 */
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date().getTime();
  const tradeTime = new Date(timestamp).getTime();
  const diffInMinutes = Math.floor((now - tradeTime) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

/**
 * Format a number as US currency
 * @param amount - Dollar amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Generate brokerage-specific stock URL for a given ticker
 * @param brokerageId - Brokerage identifier (e.g., 'robinhood', 'fidelity')
 * @param ticker - Stock ticker symbol
 * @returns URL to view the stock on the specified brokerage platform
 */
export const getBrokerageStockUrl = (
  brokerageId: string,
  ticker: string
): string => {
  const t = encodeURIComponent(ticker.toUpperCase());

  const urlMap: Record<string, string> = {
    robinhood: `https://robinhood.com/stocks/${t}`,
    webull: `https://www.webull.com/quote/nasdaq-${t}`,
    fidelity: `https://eresearch.fidelity.com/eresearch/goto/evaluate/snapshot.jhtml?symbols=${t}`,
    schwab: `https://www.schwab.com/stock-research/quotes/${t}`,
    etrade: `https://us.etrade.com/etx/pm/research/stocks/overview?symbol=${t}`,
    td: `https://research.tdameritrade.com/grid/public/research/stocks/summary?symbol=${t}`,
    interactive: `https://www.interactivebrokers.com/en/trading/products.php?type=stocks&symbol=${t}`,
  };

  return (
    urlMap[brokerageId] || `https://www.google.com/finance/quote/${t}:NASDAQ`
  );
};
