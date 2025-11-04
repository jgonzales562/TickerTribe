// Custom hook for managing brokerage connections

import { useCallback } from 'react';
import type { Brokerage } from '../types/dashboard';
import { DEFAULT_BROKERAGES } from '../constants/dashboard';
import { useLocalStorage } from './useLocalStorage';

export const useBrokerages = () => {
  const [brokerages, setBrokerages] = useLocalStorage<Brokerage[]>(
    'brokerages',
    [...DEFAULT_BROKERAGES]
  );

  const [defaultBrokerage, setDefaultBrokerage] = useLocalStorage<string>(
    'defaultBrokerage',
    ''
  );

  const toggleBrokerageConnection = useCallback(
    (brokerageId: string) => {
      setBrokerages((prev) =>
        prev.map((b) =>
          b.id === brokerageId ? { ...b, isConnected: !b.isConnected } : b
        )
      );
    },
    [setBrokerages]
  );

  return {
    brokerages,
    defaultBrokerage,
    setDefaultBrokerage,
    toggleBrokerageConnection,
  };
};
