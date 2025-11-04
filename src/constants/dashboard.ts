// Dashboard Constants

// Timing constants (in milliseconds)
export const POLL_INTERVAL = 15000; // Check for new trades every 15 seconds
export const NOTIFICATION_TIMEOUT = 5000; // Auto-dismiss notifications after 5 seconds
export const ANIMATION_DURATION = 1000; // Trade card animation duration
export const FADE_DURATION = 300; // Notification fade duration
export const INITIAL_LOAD_DELAY = 1000; // Simulated API delay for initial data load

// Trade generation
export const TRADE_ARRIVAL_PROBABILITY = 0.3; // 30% chance of new trade per interval

// Mock data for generating random trades
export const MOCK_TICKERS = [
  'AAPL',
  'TSLA',
  'NVDA',
  'MSFT',
  'GOOGL',
  'AMZN',
  'META',
  'SPY',
  'QQQ',
  'AMD',
] as const;

export const TRADE_ACTIONS = ['BUY', 'SELL'] as const;

export const MOCK_NOTES = [
  'Strong technical breakout',
  'Taking profits at resistance',
  'Buying the dip',
  'Great entry point',
  'Momentum building',
  'Rebalancing portfolio',
  'Support level holding',
  'Breakout confirmed',
  'Overbought, taking profits',
  'Value play here',
] as const;

// Default mock trades for initial load
export const INITIAL_MOCK_TRADES = [
  {
    id: 1,
    ticker: 'AAPL',
    action: 'BUY' as const,
    quantity: 100,
    price: 178.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    traderName: 'Master Trader',
    traderAvatar: '👤',
    notes: 'Strong technical breakout, buying the dip',
    comments: [],
  },
  {
    id: 2,
    ticker: 'TSLA',
    action: 'SELL' as const,
    quantity: 50,
    price: 242.84,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    traderName: 'Master Trader',
    traderAvatar: '👤',
    notes: 'Taking profits at resistance level',
    comments: [],
  },
  {
    id: 3,
    ticker: 'NVDA',
    action: 'BUY' as const,
    quantity: 75,
    price: 505.25,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    traderName: 'Master Trader',
    traderAvatar: '👤',
    notes: 'AI sector looks bullish',
    comments: [],
  },
  {
    id: 4,
    ticker: 'SPY',
    action: 'BUY' as const,
    quantity: 200,
    price: 445.75,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    traderName: 'Master Trader',
    traderAvatar: '👤',
    comments: [],
  },
  {
    id: 5,
    ticker: 'MSFT',
    action: 'SELL' as const,
    quantity: 80,
    price: 380.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    traderName: 'Master Trader',
    traderAvatar: '👤',
    notes: 'Rebalancing portfolio',
    comments: [],
  },
];

// Default brokerages
export const DEFAULT_BROKERAGES = [
  {
    id: 'robinhood',
    name: 'Robinhood',
    logo: '🏹',
    isConnected: false,
  },
  {
    id: 'webull',
    name: 'Webull',
    logo: '🐂',
    isConnected: false,
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    logo: '💼',
    isConnected: false,
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    logo: '🏦',
    isConnected: false,
  },
  {
    id: 'etrade',
    name: 'E*TRADE',
    logo: '📈',
    isConnected: false,
  },
  {
    id: 'td',
    name: 'TD Ameritrade',
    logo: '🎯',
    isConnected: false,
  },
  {
    id: 'interactive',
    name: 'Interactive Brokers',
    logo: '🌐',
    isConnected: false,
  },
] as const;
