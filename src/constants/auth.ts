// Authentication and user constants

// Mock taken usernames for demo purposes
// Note: In production, this would be checked via API
export const MOCK_TAKEN_USERNAMES = [
  'admin',
  'user',
  'test',
  'demo',
  'stockmaster',
  'trader123',
] as const;

// Default trader information
export const DEFAULT_TRADER_NAME = 'Master Trader';
export const DEFAULT_TRADER_AVATAR = '👤';

// Default username for comments (when user is logged in)
// Note: In production, this would come from auth context
export const DEFAULT_COMMENT_USERNAME = 'You';
