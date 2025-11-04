// Individual trade card component with React.memo for performance

import type React from 'react';
import { memo } from 'react';
import type { Trade, Brokerage } from '../types/dashboard';
import {
  formatTimeAgo,
  formatCurrency,
  getBrokerageStockUrl,
} from '../utils/dashboard';

interface TradeCardProps {
  trade: Trade;
  isNewTrade: boolean;
  isExpanded: boolean;
  commentText: string;
  brokerages: Brokerage[];
  defaultBrokerage: string;
  selectedBrokerage: string;
  onToggleComments: (tradeId: number) => void;
  onCommentChange: (tradeId: number, text: string) => void;
  onAddComment: (tradeId: number) => void;
  onCopyTrade: (trade: Trade) => void;
  onBrokerageSelect: (tradeId: number, brokerageId: string) => void;
  onOpenBrokerageModal: () => void;
}

const TradeCardComponent: React.FC<TradeCardProps> = ({
  trade,
  isNewTrade,
  isExpanded,
  commentText,
  brokerages,
  defaultBrokerage,
  selectedBrokerage,
  onToggleComments,
  onCommentChange,
  onAddComment,
  onCopyTrade,
  onBrokerageSelect,
  onOpenBrokerageModal,
}) => {
  return (
    <div
      className={`trade-card ${isNewTrade ? 'new-trade' : ''} ${
        trade.isCopied ? 'copied-trade' : ''
      }`}
    >
      <div className='trade-header'>
        <div className='trader-info'>
          <span className='trader-avatar'>{trade.traderAvatar}</span>
          <span className='trader-name'>{trade.traderName}</span>
          {trade.isCopied && (
            <span className='copied-badge' title='Trade copied to your account'>
              ✓ Copied
            </span>
          )}
        </div>
        <span className='trade-time'>{formatTimeAgo(trade.timestamp)}</span>
      </div>

      <div className='trade-body'>
        <div className='trade-main-info'>
          <span className={`trade-action ${trade.action.toLowerCase()}`}>
            {trade.action}
          </span>
          <span className='trade-ticker'>{trade.ticker}</span>
        </div>

        <div className='trade-details'>
          <div className='detail-item'>
            <span className='detail-label'>Quantity</span>
            <span className='detail-value'>{trade.quantity} shares</span>
          </div>
          <div className='detail-item'>
            <span className='detail-label'>Price</span>
            <span className='detail-value'>{formatCurrency(trade.price)}</span>
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

        {/* Open on Brokerage (Dropdown) */}
        <div className='brokerage-open'>
          <span className='links-label'>Open on:</span>
          <select
            className='brokerage-select small'
            value={selectedBrokerage || defaultBrokerage || ''}
            onChange={(e) => onBrokerageSelect(trade.id, e.target.value)}
            aria-label={`Select brokerage to view ${trade.ticker}`}
          >
            <option value='' disabled>
              Select brokerage…
            </option>
            {brokerages.map((b) => (
              <option key={b.id} value={b.id}>
                {b.logo} {b.name}
                {b.isConnected ? '' : ' (not connected)'}
              </option>
            ))}
          </select>
          <button
            className='btn-open'
            disabled={!(selectedBrokerage || defaultBrokerage)}
            onClick={() => {
              const id = selectedBrokerage || defaultBrokerage;
              if (!id) return;
              const url = getBrokerageStockUrl(id, trade.ticker);
              window.open(url, '_blank', 'noreferrer');
            }}
          >
            Open
          </button>
          <button className='btn-link' onClick={onOpenBrokerageModal}>
            Manage →
          </button>
        </div>

        {/* Copy Trade Button */}
        {!trade.isCopied && (
          <div className='trade-actions'>
            <button
              className='copy-trade-button'
              onClick={() => onCopyTrade(trade)}
              aria-label={`Copy trade: ${trade.action} ${trade.quantity} shares of ${trade.ticker} at ${trade.price}`}
            >
              <span className='copy-icon' aria-hidden='true'>
                📋
              </span>
              Copy This Trade
            </button>
          </div>
        )}

        {/* Comments Section */}
        <div className='trade-comments-section'>
          {/* Existing Comments (collapsible) */}
          {trade.comments && trade.comments.length > 0 && (
            <>
              <button
                className='comments-toggle'
                onClick={() => onToggleComments(trade.id)}
              >
                💬 {isExpanded ? 'Hide' : 'View'} {trade.comments.length}{' '}
                {trade.comments.length === 1 ? 'Comment' : 'Comments'}
              </button>

              {isExpanded && (
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
                      <div className='comment-text'>{comment.text}</div>
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
              value={commentText || ''}
              onChange={(e) => onCommentChange(trade.id, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onAddComment(trade.id);
                }
              }}
              aria-label={`Add comment to ${trade.ticker} trade`}
            />
            <button
              className='comment-submit'
              onClick={() => onAddComment(trade.id)}
              disabled={!commentText?.trim()}
              aria-label='Post comment'
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const TradeCard = memo(TradeCardComponent);
