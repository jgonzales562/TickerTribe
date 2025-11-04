// Custom hook for managing copy trading logic

import { useState, useCallback } from 'react';
import type {
  Trade,
  PendingCopyTrade,
  Brokerage,
  CopyQuantityType,
} from '../types/dashboard';
import { useLocalStorage } from './useLocalStorage';
import { calculatePercentageQuantity } from '../utils/calculations';

export const useCopyTrading = (
  _brokerages: Brokerage[],
  onTradeExecuted: (trade: Trade, quantity: number, brokerage: string) => void
) => {
  const [copyQuantityType, setCopyQuantityType] =
    useLocalStorage<CopyQuantityType>('copyQuantityType', 'same');

  const [customQuantity, setCustomQuantity] = useLocalStorage<number>(
    'customQuantity',
    100
  );

  const [quantityPercentage, setQuantityPercentage] = useLocalStorage<number>(
    'quantityPercentage',
    100
  );

  const [pendingTrade, setPendingTrade] = useState<PendingCopyTrade | null>(
    null
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const calculateCopyQuantity = useCallback(
    (originalQuantity: number) => {
      switch (copyQuantityType) {
        case 'custom':
          return customQuantity;
        case 'percentage':
          return calculatePercentageQuantity(
            originalQuantity,
            quantityPercentage
          );
        case 'same':
        default:
          return originalQuantity;
      }
    },
    [copyQuantityType, customQuantity, quantityPercentage]
  );

  const executeCopyTrade = useCallback(
    (trade: Trade, quantity: number, brokerage: string) => {
      // Note: CopyTradeExecution tracking can be added later for history/analytics
      onTradeExecuted(trade, quantity, brokerage);
    },
    [onTradeExecuted]
  );

  const initiateCopyTrade = useCallback(
    (trade: Trade, defaultBrokerage: string) => {
      const copyQty = calculateCopyQuantity(trade.quantity);
      setPendingTrade({
        trade: trade,
        customQuantity: copyQty,
        selectedBrokerage: defaultBrokerage,
      });
      setShowApprovalModal(true);
    },
    [calculateCopyQuantity]
  );

  const approveTrade = useCallback(() => {
    if (pendingTrade && pendingTrade.selectedBrokerage) {
      executeCopyTrade(
        pendingTrade.trade,
        pendingTrade.customQuantity,
        pendingTrade.selectedBrokerage
      );
      setShowApprovalModal(false);
      setPendingTrade(null);
    }
  }, [pendingTrade, executeCopyTrade]);

  const rejectTrade = useCallback(() => {
    setShowApprovalModal(false);
    setPendingTrade(null);
  }, []);

  const updatePendingTradeQuantity = useCallback(
    (newQuantity: number) => {
      if (pendingTrade) {
        setPendingTrade({
          ...pendingTrade,
          customQuantity: newQuantity,
        });
      }
    },
    [pendingTrade]
  );

  const updatePendingTradeBrokerage = useCallback(
    (brokerageId: string) => {
      if (pendingTrade) {
        setPendingTrade({
          ...pendingTrade,
          selectedBrokerage: brokerageId,
        });
      }
    },
    [pendingTrade]
  );

  return {
    copyQuantityType,
    setCopyQuantityType,
    customQuantity,
    setCustomQuantity,
    quantityPercentage,
    setQuantityPercentage,
    pendingTrade,
    showApprovalModal,
    setShowApprovalModal,
    calculateCopyQuantity,
    initiateCopyTrade,
    approveTrade,
    rejectTrade,
    updatePendingTradeQuantity,
    updatePendingTradeBrokerage,
  };
};
