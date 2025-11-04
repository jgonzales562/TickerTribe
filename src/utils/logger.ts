// Simple environment-aware logger utility

import { isDevelopment } from '../config/environment';

// Prefix to help filter logs
const PREFIX = '[TickerTribe]';

type AnyArgs = unknown[];

const noop = () => {};

const devConsole = {
  info: (...args: AnyArgs) => console.info(PREFIX, ...args),
  warn: (...args: AnyArgs) => console.warn(PREFIX, ...args),
  error: (...args: AnyArgs) => console.error(PREFIX, ...args),
  debug: (...args: AnyArgs) => console.debug(PREFIX, ...args),
};

const prodConsole = {
  // Keep error logs in production; suppress noisy info/debug
  info: noop,
  warn: (...args: AnyArgs) => console.warn(PREFIX, ...args),
  error: (...args: AnyArgs) => console.error(PREFIX, ...args),
  debug: noop,
};

export const logger = isDevelopment ? devConsole : prodConsole;
