// TypeScript interfaces and types for Dashboard

export interface Comment {
  id: number;
  tradeId: number;
  username: string;
  text: string;
  timestamp: string;
}

export interface Trade {
  id: number;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  traderName: string;
  traderAvatar: string;
  notes?: string;
  comments?: Comment[];
  isCopied?: boolean;
}

export interface Brokerage {
  id: string;
  name: string;
  logo: string;
  isConnected: boolean;
}

export interface PendingCopyTrade {
  trade: Trade;
  customQuantity: number;
  selectedBrokerage: string;
}

export interface Notification {
  id: number;
  trade: Trade;
  isVisible: boolean;
}

export type CopyQuantityType = 'same' | 'custom' | 'percentage';
