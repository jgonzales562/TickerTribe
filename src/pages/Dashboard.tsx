import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import type { Trade, Comment } from '../types/dashboard';
import {
  POLL_INTERVAL,
  ANIMATION_DURATION,
  TRADE_ARRIVAL_PROBABILITY,
  INITIAL_MOCK_TRADES,
  INITIAL_LOAD_DELAY,
} from '../constants/dashboard';
import { DEFAULT_COMMENT_USERNAME } from '../constants/auth';
import { generateRandomTrade } from '../utils/dashboard';
import { calculatePercentageQuantity } from '../utils/calculations';
import { sanitizeCommentText } from '../utils/sanitize';
import { APP_CONFIG } from '../config/environment';
import { useNotifications } from '../hooks/useNotifications';
import { useBrokerages } from '../hooks/useBrokerages';
import { useCopyTrading } from '../hooks/useCopyTrading';
import { useSound } from '../hooks/useSound';
import { NotificationList } from '../components/NotificationList';
import { TradeCard } from '../components/TradeCard';
import { ApprovalModal } from '../components/ApprovalModal';
import { BrokerageModal } from '../components/BrokerageModal';

function Dashboard() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTradeAnimation, setNewTradeAnimation] = useState<number | null>(
    null
  );
  const [expandedTradeId, setExpandedTradeId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [brokerageSelection, setBrokerageSelection] = useState<{
    [key: number]: string;
  }>({});
  const [showBrokerageModal, setShowBrokerageModal] = useState(false);

  // Sound hook
  const { soundEnabled, toggleSound, playNotificationSound } = useSound();

  // Custom hooks
  const { notifications, addNotification, dismissNotification } =
    useNotifications(playNotificationSound);
  const {
    brokerages,
    defaultBrokerage,
    setDefaultBrokerage,
    toggleBrokerageConnection,
  } = useBrokerages();

  const handleTradeExecuted = useCallback(
    (trade: Trade, quantity: number, brokerage: string) => {
      const brokerageName =
        brokerages.find((b) => b.id === brokerage)?.name || 'Unknown';
      setTrades((prevTrades) =>
        prevTrades.map((t) =>
          t.id === trade.id ? { ...t, isCopied: true } : t
        )
      );
      const message = `✓ Copy Trade Executed on ${brokerageName}: ${trade.action} ${quantity} ${trade.ticker} @ $${trade.price}`;
      addNotification(trade, message);
    },
    [brokerages, addNotification]
  );

  const {
    copyQuantityType,
    setCopyQuantityType,
    customQuantity,
    setCustomQuantity,
    quantityPercentage,
    setQuantityPercentage,
    pendingTrade,
    showApprovalModal,
    setShowApprovalModal,
    initiateCopyTrade,
    approveTrade,
    rejectTrade,
    updatePendingTradeQuantity,
    updatePendingTradeBrokerage,
  } = useCopyTrading(brokerages, handleTradeExecuted);

  // Memoized connected brokerages count for performance optimization
  // Prevents recalculation on every render when brokerages list doesn't change
  const connectedBrokeragesCount = useMemo(
    () => brokerages.filter((b) => b.isConnected).length,
    [brokerages]
  );

  // Initial load - simulating API call
  useEffect(() => {
    setTimeout(() => {
      setTrades(INITIAL_MOCK_TRADES.slice(0, APP_CONFIG.maxTradesDisplayed));
      setIsLoading(false);
    }, INITIAL_LOAD_DELAY);
  }, []);

  // Real-time trade polling - simulating WebSocket or API updates
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      if (Math.random() < TRADE_ARRIVAL_PROBABILITY) {
        const newTrade: Trade = generateRandomTrade();
        setTrades((prevTrades) =>
          [newTrade, ...prevTrades].slice(0, APP_CONFIG.maxTradesDisplayed)
        );
        setNewTradeAnimation(newTrade.id);
        setTimeout(() => setNewTradeAnimation(null), ANIMATION_DURATION);
        addNotification(newTrade);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isLoading, addNotification]);

  const handleLogout = () => {
    // Note: In production, clear auth tokens and call logout API
    navigate('/login');
  };
  const toggleComments = (tradeId: number) =>
    setExpandedTradeId((prev) => (prev === tradeId ? null : tradeId));

  const handleAddComment = (tradeId: number) => {
    const raw = commentText[tradeId] ?? '';
    const text = sanitizeCommentText(raw, APP_CONFIG.maxCommentLength);
    if (!text) return;
    // Note: In production, this would be an API call to save the comment
    const newComment: Comment = {
      id: Date.now(),
      tradeId,
      username: DEFAULT_COMMENT_USERNAME,
      text,
      timestamp: new Date().toISOString(),
    };
    setTrades((prevTrades) =>
      prevTrades.map((trade) => {
        if (trade.id !== tradeId) return trade;
        const existing = trade.comments || [];
        if (existing.length >= APP_CONFIG.maxCommentsPerTrade) {
          // Optional: notify user max reached
          addNotification(trade, 'Comment limit reached for this trade');
          return trade;
        }
        return { ...trade, comments: [...existing, newComment] };
      })
    );
    setCommentText((prev) => ({ ...prev, [tradeId]: '' }));
  };

  const handleCopyTrade = (trade: Trade) =>
    initiateCopyTrade(trade, defaultBrokerage);

  const handleQuantityTypeChange = (type: 'same' | 'custom' | 'percentage') => {
    setCopyQuantityType(type);
    if (pendingTrade) {
      let newQty: number;
      switch (type) {
        case 'custom':
          newQty = customQuantity;
          break;
        case 'percentage':
          newQty = calculatePercentageQuantity(
            pendingTrade.trade.quantity,
            quantityPercentage
          );
          break;
        case 'same':
        default:
          newQty = pendingTrade.trade.quantity;
          break;
      }
      updatePendingTradeQuantity(newQty);
    }
  };

  const handleCustomQuantityChange = (val: number) => {
    setCustomQuantity(val);
    updatePendingTradeQuantity(val);
  };

  const handlePercentageChange = (val: number) => {
    setQuantityPercentage(val);
    if (pendingTrade) {
      const newQty = calculatePercentageQuantity(
        pendingTrade.trade.quantity,
        val
      );
      updatePendingTradeQuantity(newQty);
    }
  };

  const handleOpenBrokerageModalFromApproval = () => {
    setShowApprovalModal(false);
    setShowBrokerageModal(true);
  };

  // Keyboard shortcuts: Esc to close modals; Enter to approve when valid
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showApprovalModal) {
          e.preventDefault();
          setShowApprovalModal(false);
          return;
        }
        if (showBrokerageModal) {
          e.preventDefault();
          setShowBrokerageModal(false);
          return;
        }
      }
      if (e.key === 'Enter') {
        // Avoid triggering when typing in inputs
        const target = e.target as HTMLElement | null;
        const isFormField =
          !!target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT');
        if (isFormField) return;
        if (
          showApprovalModal &&
          pendingTrade &&
          pendingTrade.selectedBrokerage
        ) {
          e.preventDefault();
          approveTrade();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    showApprovalModal,
    showBrokerageModal,
    approveTrade,
    pendingTrade,
    setShowApprovalModal,
    setShowBrokerageModal,
  ]);

  return (
    <div className='dashboard-container'>
      <NotificationList
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <header className='dashboard-header'>
        <h1>TickerTribe</h1>
        <div className='header-actions'>
          <button
            className='settings-button'
            onClick={() => setShowBrokerageModal(true)}
            title='Manage Brokerages'
          >
            🏦 Brokerages{' '}
            {connectedBrokeragesCount > 0 && `(${connectedBrokeragesCount})`}
          </button>
          <button
            className='sound-toggle'
            onClick={toggleSound}
            title={
              soundEnabled
                ? 'Sound ON - Click to mute (preference saved)'
                : 'Sound OFF - Click to unmute (preference saved)'
            }
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button className='logout-button' onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className='dashboard-content'>
        <div className='feed-header'>
          <h2>Live Trade Feed</h2>
          <p className='feed-subtitle'>Follow Master Trader's latest moves</p>
        </div>

        {isLoading ? (
          <div className='loading-state'>
            <div className='spinner'></div>
            <p>Loading trades...</p>
          </div>
        ) : (
          <div className='trade-feed'>
            {trades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                isNewTrade={newTradeAnimation === trade.id}
                isExpanded={expandedTradeId === trade.id}
                commentText={commentText[trade.id] || ''}
                brokerages={brokerages}
                defaultBrokerage={defaultBrokerage}
                selectedBrokerage={brokerageSelection[trade.id] || ''}
                onToggleComments={toggleComments}
                onCommentChange={(tradeId, text) =>
                  setCommentText((prev) => ({ ...prev, [tradeId]: text }))
                }
                onAddComment={handleAddComment}
                onCopyTrade={handleCopyTrade}
                onBrokerageSelect={(tradeId, brokerageId) =>
                  setBrokerageSelection((prev) => ({
                    ...prev,
                    [tradeId]: brokerageId,
                  }))
                }
                onOpenBrokerageModal={() => setShowBrokerageModal(true)}
              />
            ))}
          </div>
        )}
      </main>

      {showApprovalModal && pendingTrade && (
        <ApprovalModal
          pendingTrade={pendingTrade}
          copyQuantityType={copyQuantityType}
          customQuantity={customQuantity}
          quantityPercentage={quantityPercentage}
          brokerages={brokerages}
          onApprove={approveTrade}
          onReject={rejectTrade}
          onQuantityTypeChange={handleQuantityTypeChange}
          onCustomQuantityChange={handleCustomQuantityChange}
          onPercentageChange={handlePercentageChange}
          onBrokerageSelect={updatePendingTradeBrokerage}
          onOpenBrokerageModal={handleOpenBrokerageModalFromApproval}
        />
      )}

      {showBrokerageModal && (
        <BrokerageModal
          brokerages={brokerages}
          defaultBrokerage={defaultBrokerage}
          onClose={() => setShowBrokerageModal(false)}
          onToggleConnection={toggleBrokerageConnection}
          onSetDefault={setDefaultBrokerage}
        />
      )}
    </div>
  );
}

export default Dashboard;
