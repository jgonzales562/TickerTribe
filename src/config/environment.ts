// Environment configuration and feature flags

/**
 * API Configuration
 * In production, these would be loaded from environment variables
 */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
} as const;

/**
 * Feature Flags
 * Control which features are enabled in the application
 */
export const FEATURES = {
  enableRealTimeTrading: false, // Enable when WebSocket connection is ready
  enableNotifications: true,
  enableSoundEffects: true,
  enableComments: true,
  enableBrokerageIntegration: false, // Enable when actual brokerage APIs are integrated
  enableAnalytics: false, // Enable when analytics service is configured
  enableDemoMode: true, // Currently in demo mode with mock data
} as const;

/**
 * External Service URLs
 */
export const EXTERNAL_SERVICES = {
  googleFinance: 'https://www.google.com/finance/quote',
  alphavantage: 'https://www.alphavantage.co/query',
  // Add other external service URLs as needed
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  appName: 'TickerTribe',
  version: '0.0.0',
  supportEmail: 'support@tickertribe.com',
  maxTradesDisplayed: 100,
  maxCommentsPerTrade: 50,
  maxCommentLength: 300,
} as const;

/**
 * Development/Production environment check
 */
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

/**
 * Helper function to check if a feature is enabled
 * @param feature - Feature key to check
 * @returns Whether the feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};
