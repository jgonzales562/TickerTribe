import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Comment {
  id: number;
  tradeId: number;
  username: string;
  text: string;
  timestamp: string;
}

interface Trade {
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

interface CopyTradeExecution {
  id: number;
  originalTradeId: number;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
}

interface PendingCopyTrade {
  trade: Trade;
  customQuantity: number;
}

// Mock data for generating random new trades
const TICKERS = [
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
];
const ACTIONS: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
const NOTES = [
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
];

interface Notification {
  id: number;
  trade: Trade;
  isVisible: boolean;
}

function Dashboard() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTradeAnimation, setNewTradeAnimation] = useState<number | null>(
    null
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedTradeId, setExpandedTradeId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});

  // Copy trading state
  const [copyTradingEnabled, setCopyTradingEnabled] = useState(() => {
    const saved = localStorage.getItem('copyTradingEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [manualApproval, setManualApproval] = useState(() => {
    const saved = localStorage.getItem('manualApproval');
    return saved !== null ? JSON.parse(saved) : true; // Default to true for safety
  });
  const [copyQuantityType, setCopyQuantityType] = useState<
    'same' | 'custom' | 'percentage'
  >(() => {
    const saved = localStorage.getItem('copyQuantityType');
    return (saved as 'same' | 'custom' | 'percentage') || 'same';
  });
  const [customQuantity, setCustomQuantity] = useState(() => {
    const saved = localStorage.getItem('customQuantity');
    return saved !== null ? parseInt(saved) : 100;
  });
  const [quantityPercentage, setQuantityPercentage] = useState(() => {
    const saved = localStorage.getItem('quantityPercentage');
    return saved !== null ? parseInt(saved) : 100;
  });
  const [pendingTrade, setPendingTrade] = useState<PendingCopyTrade | null>(
    null
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Store executed copy trades for history/analytics (will be used in future features)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [executedCopyTrades, setExecutedCopyTrades] = useState<
    CopyTradeExecution[]
  >([]);

  // Load sound preference from localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save sound preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Create notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Pleasant notification sound: two-tone chime
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [soundEnabled]);

  // Calculate the quantity to use for copy trading
  const calculateCopyQuantity = useCallback(
    (originalQuantity: number) => {
      switch (copyQuantityType) {
        case 'custom':
          return customQuantity;
        case 'percentage':
          return Math.floor((originalQuantity * quantityPercentage) / 100);
        case 'same':
        default:
          return originalQuantity;
      }
    },
    [copyQuantityType, customQuantity, quantityPercentage]
  );

  // Execute copy trade
  const executeCopyTrade = useCallback(
    (trade: Trade, quantity: number) => {
      // TODO: Replace with actual broker API call
      // Simulating trade execution
      const execution: CopyTradeExecution = {
        id: Date.now(),
        originalTradeId: trade.id,
        ticker: trade.ticker,
        action: trade.action,
        quantity: quantity,
        price: trade.price,
        timestamp: new Date().toISOString(),
      };

      setExecutedCopyTrades((prev) => [execution, ...prev]);

      // Mark the original trade as copied
      setTrades((prevTrades) =>
        prevTrades.map((t) =>
          t.id === trade.id ? { ...t, isCopied: true } : t
        )
      );

      // Show success notification
      const copyNotification: Notification = {
        id: Date.now() + 1,
        trade: {
          ...trade,
          notes: `✓ Copy Trade Executed: ${trade.action} ${quantity} ${trade.ticker} @ $${trade.price}`,
        },
        isVisible: true,
      };
      setNotifications((prev) => [...prev, copyNotification]);

      // Play confirmation sound
      playNotificationSound();

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === copyNotification.id ? { ...n, isVisible: false } : n
          )
        );
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== copyNotification.id)
          );
        }, 300);
      }, 5000);
    },
    [playNotificationSound]
  );

  // Save copy trading preferences to localStorage
  useEffect(() => {
    localStorage.setItem(
      'copyTradingEnabled',
      JSON.stringify(copyTradingEnabled)
    );
  }, [copyTradingEnabled]);

  useEffect(() => {
    localStorage.setItem('manualApproval', JSON.stringify(manualApproval));
  }, [manualApproval]);

  useEffect(() => {
    localStorage.setItem('copyQuantityType', copyQuantityType);
  }, [copyQuantityType]);

  useEffect(() => {
    localStorage.setItem('customQuantity', customQuantity.toString());
  }, [customQuantity]);

  useEffect(() => {
    localStorage.setItem('quantityPercentage', quantityPercentage.toString());
  }, [quantityPercentage]);

  // Initial load of trades
  useEffect(() => {
    // TODO: Replace with actual API call
    // Simulating API call to fetch trades
    setTimeout(() => {
      const mockTrades: Trade[] = [
        {
          id: 1,
          ticker: 'AAPL',
          action: 'BUY',
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
          action: 'SELL',
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
          action: 'BUY',
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
          action: 'BUY',
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
          action: 'SELL',
          quantity: 80,
          price: 380.5,
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          traderName: 'Master Trader',
          traderAvatar: '👤',
          notes: 'Rebalancing portfolio',
          comments: [],
        },
      ];
      setTrades(mockTrades);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Real-time updates - poll for new trades every 15 seconds
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      // TODO: Replace with actual WebSocket or API polling
      // Simulating new trade arrival (30% chance per interval)
      if (Math.random() < 0.3) {
        const randomTicker =
          TICKERS[Math.floor(Math.random() * TICKERS.length)];
        const randomAction =
          ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const randomQuantity = Math.floor(Math.random() * 200) + 10;
        const randomPrice = Math.random() * 500 + 50;
        const randomNote =
          Math.random() > 0.5
            ? NOTES[Math.floor(Math.random() * NOTES.length)]
            : undefined;

        const newTrade: Trade = {
          id: Date.now(), // Use timestamp as unique ID
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

        setTrades((prevTrades) => [newTrade, ...prevTrades]);
        setNewTradeAnimation(newTrade.id);

        // Remove animation class after animation completes
        setTimeout(() => {
          setNewTradeAnimation(null);
        }, 1000);

        // Show notification
        const notification: Notification = {
          id: newTrade.id,
          trade: newTrade,
          isVisible: true,
        };
        setNotifications((prev) => [...prev, notification]);

        // Play notification sound
        playNotificationSound();

        // Handle copy trading
        if (copyTradingEnabled) {
          const copyQty = calculateCopyQuantity(newTrade.quantity);

          if (manualApproval) {
            // Show approval modal for manual confirmation
            setPendingTrade({
              trade: newTrade,
              customQuantity: copyQty,
            });
            setShowApprovalModal(true);
          } else {
            // Auto-execute without approval
            executeCopyTrade(newTrade, copyQty);
          }
        }

        // Auto-dismiss notification after 5 seconds
        setTimeout(() => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isVisible: false } : n
            )
          );
          // Remove from array after fade out animation
          setTimeout(() => {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== notification.id)
            );
          }, 300);
        }, 5000);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [
    isLoading,
    playNotificationSound,
    copyTradingEnabled,
    executeCopyTrade,
    manualApproval,
    calculateCopyQuantity,
  ]);

  const handleLogout = () => {
    // TODO: Implement actual logout logic (clear tokens, etc.)
    navigate('/login');
  };

  const handleApproveTrade = () => {
    if (pendingTrade) {
      executeCopyTrade(pendingTrade.trade, pendingTrade.customQuantity);
      setShowApprovalModal(false);
      setPendingTrade(null);
    }
  };

  const handleRejectTrade = () => {
    setShowApprovalModal(false);
    setPendingTrade(null);
  };

  const handleAddComment = (tradeId: number) => {
    const text = commentText[tradeId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: Date.now(),
      tradeId,
      username: 'CurrentUser', // TODO: Get from auth context
      text,
      timestamp: new Date().toISOString(),
    };

    setTrades((prevTrades) =>
      prevTrades.map((trade) =>
        trade.id === tradeId
          ? { ...trade, comments: [...(trade.comments || []), newComment] }
          : trade
      )
    );

    setCommentText((prev) => ({ ...prev, [tradeId]: '' }));
  };

  const toggleComments = (tradeId: number) => {
    setExpandedTradeId((prev) => (prev === tradeId ? null : tradeId));
  };

  const formatTimeAgo = (timestamp: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const dismissNotification = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  return (
    <div className='dashboard-container'>
      {/* Notifications */}
      <div className='notifications-container'>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${
              notification.isVisible ? 'visible' : 'hidden'
            }`}
          >
            <div className='notification-header'>
              <span className='notification-icon'>🔔</span>
              <span className='notification-title'>New Trade Alert</span>
              <button
                className='notification-close'
                onClick={() => dismissNotification(notification.id)}
              >
                ✕
              </button>
            </div>
            <div className='notification-body'>
              <div className='notification-trade-info'>
                <span
                  className={`notification-action ${notification.trade.action.toLowerCase()}`}
                >
                  {notification.trade.action}
                </span>
                <span className='notification-ticker'>
                  {notification.trade.ticker}
                </span>
              </div>
              <div className='notification-details'>
                {notification.trade.quantity} shares @{' '}
                {formatCurrency(notification.trade.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <header className='dashboard-header'>
        <h1>TickerTribe</h1>
        <div className='header-actions'>
          <div className='copy-trading-toggle'>
            <label className='toggle-label'>
              <span className='toggle-text'>
                Copy Trading {copyTradingEnabled ? 'ON' : 'OFF'}
              </span>
              <div className='toggle-switch'>
                <input
                  type='checkbox'
                  checked={copyTradingEnabled}
                  onChange={(e) => setCopyTradingEnabled(e.target.checked)}
                />
                <span className='slider'></span>
              </div>
            </label>
          </div>
          {copyTradingEnabled && (
            <button
              className='settings-button'
              onClick={() => setShowSettingsModal(true)}
              title='Copy Trading Settings'
            >
              ⚙️
            </button>
          )}
          <button
            className='sound-toggle'
            onClick={() => setSoundEnabled(!soundEnabled)}
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
              <div
                key={trade.id}
                className={`trade-card ${
                  newTradeAnimation === trade.id ? 'new-trade' : ''
                } ${trade.isCopied ? 'copied-trade' : ''}`}
              >
                <div className='trade-header'>
                  <div className='trader-info'>
                    <span className='trader-avatar'>{trade.traderAvatar}</span>
                    <span className='trader-name'>{trade.traderName}</span>
                    {trade.isCopied && (
                      <span
                        className='copied-badge'
                        title='Trade copied to your account'
                      >
                        ✓ Copied
                      </span>
                    )}
                  </div>
                  <span className='trade-time'>
                    {formatTimeAgo(trade.timestamp)}
                  </span>
                </div>

                <div className='trade-body'>
                  <div className='trade-main-info'>
                    <span
                      className={`trade-action ${trade.action.toLowerCase()}`}
                    >
                      {trade.action}
                    </span>
                    <span className='trade-ticker'>{trade.ticker}</span>
                  </div>

                  <div className='trade-details'>
                    <div className='detail-item'>
                      <span className='detail-label'>Quantity</span>
                      <span className='detail-value'>
                        {trade.quantity} shares
                      </span>
                    </div>
                    <div className='detail-item'>
                      <span className='detail-label'>Price</span>
                      <span className='detail-value'>
                        {formatCurrency(trade.price)}
                      </span>
                    </div>
                    <div className='detail-item'>
                      <span className='detail-label'>Total</span>
                      <span className='detail-value total'>
                        {formatCurrency(trade.quantity * trade.price)}
                      </span>
                    </div>
                  </div>

                  {trade.notes && (
                    <div className='trade-notes'>
                      <span className='notes-icon'>💭</span>
                      <span className='notes-text'>{trade.notes}</span>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className='trade-comments-section'>
                    {/* Existing Comments (collapsible) */}
                    {trade.comments && trade.comments.length > 0 && (
                      <>
                        <button
                          className='comments-toggle'
                          onClick={() => toggleComments(trade.id)}
                        >
                          💬 {expandedTradeId === trade.id ? 'Hide' : 'View'}{' '}
                          {trade.comments.length}{' '}
                          {trade.comments.length === 1 ? 'Comment' : 'Comments'}
                        </button>

                        {expandedTradeId === trade.id && (
                          <div className='comments-list'>
                            {trade.comments.map((comment) => (
                              <div key={comment.id} className='comment'>
                                <div className='comment-header'>
                                  <span className='comment-username'>
                                    {comment.username}
                                  </span>
                                  <span className='comment-time'>
                                    {formatTimeAgo(comment.timestamp)}
                                  </span>
                                </div>
                                <div className='comment-text'>
                                  {comment.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Add Comment Form - Always Visible */}
                    <div className='add-comment-form'>
                      <input
                        type='text'
                        className='comment-input'
                        placeholder='Add a comment...'
                        value={commentText[trade.id] || ''}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [trade.id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(trade.id);
                          }
                        }}
                      />
                      <button
                        className='comment-submit'
                        onClick={() => handleAddComment(trade.id)}
                        disabled={!commentText[trade.id]?.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Copy Trade Approval Modal */}
      {showApprovalModal && pendingTrade && (
        <div className='modal-overlay' onClick={handleRejectTrade}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Approve Copy Trade?</h3>
              <button className='modal-close' onClick={handleRejectTrade}>
                ✕
              </button>
            </div>
            <div className='modal-body'>
              <div className='trade-preview'>
                <div className='preview-row'>
                  <span className='preview-label'>Action:</span>
                  <span
                    className={`preview-value action-${pendingTrade.trade.action.toLowerCase()}`}
                  >
                    {pendingTrade.trade.action}
                  </span>
                </div>
                <div className='preview-row'>
                  <span className='preview-label'>Ticker:</span>
                  <span className='preview-value'>
                    {pendingTrade.trade.ticker}
                  </span>
                </div>
                <div className='preview-row'>
                  <span className='preview-label'>Original Quantity:</span>
                  <span className='preview-value'>
                    {pendingTrade.trade.quantity} shares
                  </span>
                </div>
                <div className='preview-row'>
                  <span className='preview-label'>Your Quantity:</span>
                  <span className='preview-value highlight'>
                    {pendingTrade.customQuantity} shares
                  </span>
                </div>
                <div className='preview-row'>
                  <span className='preview-label'>Price:</span>
                  <span className='preview-value'>
                    {formatCurrency(pendingTrade.trade.price)}
                  </span>
                </div>
                <div className='preview-row total-row'>
                  <span className='preview-label'>Total Cost:</span>
                  <span className='preview-value total'>
                    {formatCurrency(
                      pendingTrade.trade.price * pendingTrade.customQuantity
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className='modal-actions'>
              <button className='btn-reject' onClick={handleRejectTrade}>
                Reject
              </button>
              <button className='btn-approve' onClick={handleApproveTrade}>
                Approve & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Trading Settings Modal */}
      {showSettingsModal && (
        <div
          className='modal-overlay'
          onClick={() => setShowSettingsModal(false)}
        >
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Copy Trading Settings</h3>
              <button
                className='modal-close'
                onClick={() => setShowSettingsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className='modal-body settings-body'>
              {/* Manual Approval Toggle */}
              <div className='setting-section'>
                <div className='setting-header'>
                  <label className='setting-label'>Manual Approval</label>
                  <div className='toggle-switch small'>
                    <input
                      type='checkbox'
                      checked={manualApproval}
                      onChange={(e) => setManualApproval(e.target.checked)}
                    />
                    <span className='slider'></span>
                  </div>
                </div>
                <p className='setting-description'>
                  {manualApproval
                    ? 'You will be asked to approve each trade before it executes.'
                    : 'Trades will execute automatically without confirmation.'}
                </p>
              </div>

              {/* Quantity Settings */}
              <div className='setting-section'>
                <label className='setting-label'>Quantity Mode</label>
                <div className='radio-group'>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='quantityType'
                      value='same'
                      checked={copyQuantityType === 'same'}
                      onChange={(e) =>
                        setCopyQuantityType(
                          e.target.value as 'same' | 'custom' | 'percentage'
                        )
                      }
                    />
                    <span>Same as Master Trader</span>
                  </label>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='quantityType'
                      value='custom'
                      checked={copyQuantityType === 'custom'}
                      onChange={(e) =>
                        setCopyQuantityType(
                          e.target.value as 'same' | 'custom' | 'percentage'
                        )
                      }
                    />
                    <span>Custom Fixed Quantity</span>
                  </label>
                  <label className='radio-option'>
                    <input
                      type='radio'
                      name='quantityType'
                      value='percentage'
                      checked={copyQuantityType === 'percentage'}
                      onChange={(e) =>
                        setCopyQuantityType(
                          e.target.value as 'same' | 'custom' | 'percentage'
                        )
                      }
                    />
                    <span>Percentage of Master Trader</span>
                  </label>
                </div>

                {copyQuantityType === 'custom' && (
                  <div className='input-group'>
                    <label>Fixed Quantity (shares):</label>
                    <input
                      type='number'
                      min='1'
                      value={customQuantity}
                      onChange={(e) =>
                        setCustomQuantity(parseInt(e.target.value) || 1)
                      }
                      className='quantity-input'
                    />
                  </div>
                )}

                {copyQuantityType === 'percentage' && (
                  <div className='input-group'>
                    <label>Percentage (%):</label>
                    <input
                      type='number'
                      min='1'
                      max='500'
                      value={quantityPercentage}
                      onChange={(e) =>
                        setQuantityPercentage(parseInt(e.target.value) || 100)
                      }
                      className='quantity-input'
                    />
                    <p className='input-hint'>
                      {quantityPercentage}% of Master Trader's quantity
                      {quantityPercentage > 100 && ' (leveraged)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className='modal-actions'>
              <button
                className='btn-primary'
                onClick={() => setShowSettingsModal(false)}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
