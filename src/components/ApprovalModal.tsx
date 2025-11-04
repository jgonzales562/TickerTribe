// Copy trade approval modal component

import type React from 'react';
import type {
  PendingCopyTrade,
  Brokerage,
  CopyQuantityType,
} from '../types/dashboard';
import { formatCurrency } from '../utils/dashboard';

interface ApprovalModalProps {
  pendingTrade: PendingCopyTrade;
  copyQuantityType: CopyQuantityType;
  customQuantity: number;
  quantityPercentage: number;
  brokerages: Brokerage[];
  onApprove: () => void;
  onReject: () => void;
  onQuantityTypeChange: (type: CopyQuantityType) => void;
  onCustomQuantityChange: (value: number) => void;
  onPercentageChange: (value: number) => void;
  onBrokerageSelect: (brokerageId: string) => void;
  onOpenBrokerageModal: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  pendingTrade,
  copyQuantityType,
  customQuantity,
  quantityPercentage,
  brokerages,
  onApprove,
  onReject,
  onQuantityTypeChange,
  onCustomQuantityChange,
  onPercentageChange,
  onBrokerageSelect,
  onOpenBrokerageModal,
}) => {
  return (
    <div
      className='modal-overlay'
      onClick={onReject}
      role='dialog'
      aria-modal='true'
      aria-labelledby='approval-modal-title'
    >
      <div
        className='modal-content modal-large'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-header'>
          <h3 id='approval-modal-title'>
            Copy Trade: {pendingTrade.trade.ticker}
          </h3>
          <button
            className='modal-close'
            onClick={onReject}
            aria-label='Close modal'
          >
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
              <span className='preview-value'>{pendingTrade.trade.ticker}</span>
            </div>
            <div className='preview-row'>
              <span className='preview-label'>Original Quantity:</span>
              <span className='preview-value'>
                {pendingTrade.trade.quantity} shares
              </span>
            </div>
            <div className='preview-row'>
              <span className='preview-label'>Price:</span>
              <span className='preview-value'>
                {formatCurrency(pendingTrade.trade.price)}
              </span>
            </div>
          </div>

          {/* Quantity Settings */}
          <div className='modal-section'>
            <h4>Quantity to Copy</h4>
            <div className='quantity-settings'>
              <div className='radio-group'>
                <label className='radio-option'>
                  <input
                    type='radio'
                    name='quantityType'
                    value='same'
                    checked={copyQuantityType === 'same'}
                    onChange={() => onQuantityTypeChange('same')}
                    aria-label='Copy same quantity as master trader'
                  />
                  <div className='radio-content'>
                    <span className='radio-title'>Same as Master</span>
                    <span className='radio-description'>
                      {pendingTrade.trade.quantity} shares
                    </span>
                  </div>
                </label>
                <label className='radio-option'>
                  <input
                    type='radio'
                    name='quantityType'
                    value='custom'
                    checked={copyQuantityType === 'custom'}
                    onChange={() => onQuantityTypeChange('custom')}
                    aria-label='Copy with custom quantity'
                  />
                  <div className='radio-content'>
                    <span className='radio-title'>Custom Amount</span>
                    {copyQuantityType === 'custom' && (
                      <input
                        type='number'
                        min='1'
                        value={customQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          onCustomQuantityChange(val);
                        }}
                        className='inline-quantity-input'
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    {copyQuantityType !== 'custom' && (
                      <span className='radio-description'>Fixed quantity</span>
                    )}
                  </div>
                </label>
                <label className='radio-option'>
                  <input
                    type='radio'
                    name='quantityType'
                    value='percentage'
                    checked={copyQuantityType === 'percentage'}
                    onChange={() => onQuantityTypeChange('percentage')}
                    aria-label='Copy with percentage of master quantity'
                  />
                  <div className='radio-content'>
                    <span className='radio-title'>Percentage</span>
                    {copyQuantityType === 'percentage' && (
                      <div className='percentage-control'>
                        <input
                          type='number'
                          min='1'
                          max='500'
                          value={quantityPercentage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 100;
                            onPercentageChange(val);
                          }}
                          className='inline-quantity-input'
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>
                          % ={' '}
                          {Math.floor(
                            (pendingTrade.trade.quantity * quantityPercentage) /
                              100
                          )}{' '}
                          shares
                        </span>
                      </div>
                    )}
                    {copyQuantityType !== 'percentage' && (
                      <span className='radio-description'>
                        Scale up or down
                      </span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Total Cost Display */}
            <div className='preview-row total-row'>
              <span className='preview-label'>Total Cost:</span>
              <span className='preview-value total'>
                {formatCurrency(
                  pendingTrade.trade.price * pendingTrade.customQuantity
                )}
              </span>
            </div>
          </div>

          {/* Brokerage Selection */}
          <div className='modal-section'>
            <div className='section-header'>
              <h4>Select Brokerage</h4>
              <button className='btn-link' onClick={onOpenBrokerageModal}>
                Manage →
              </button>
            </div>
            {brokerages.filter((b) => b.isConnected).length === 0 ? (
              <div className='no-brokerages'>
                <p>No brokerages connected.</p>
                <button className='btn-link' onClick={onOpenBrokerageModal}>
                  Connect a brokerage →
                </button>
              </div>
            ) : (
              <div className='brokerage-options'>
                {brokerages
                  .filter((b) => b.isConnected)
                  .map((brokerage) => (
                    <label
                      key={brokerage.id}
                      className={`brokerage-option ${
                        pendingTrade.selectedBrokerage === brokerage.id
                          ? 'selected'
                          : ''
                      }`}
                    >
                      <input
                        type='radio'
                        name='brokerage'
                        value={brokerage.id}
                        checked={
                          pendingTrade.selectedBrokerage === brokerage.id
                        }
                        onChange={() => onBrokerageSelect(brokerage.id)}
                      />
                      <span className='brokerage-logo'>{brokerage.logo}</span>
                      <span className='brokerage-name'>{brokerage.name}</span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className='modal-actions'>
          <button className='btn-reject' onClick={onReject}>
            Reject
          </button>
          <button
            className='btn-approve'
            onClick={onApprove}
            disabled={!pendingTrade.selectedBrokerage}
          >
            Approve & Execute
          </button>
        </div>
      </div>
    </div>
  );
};
