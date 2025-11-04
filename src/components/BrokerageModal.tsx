// Brokerage management modal component

import type React from 'react';
import type { Brokerage } from '../types/dashboard';

interface BrokerageModalProps {
  brokerages: Brokerage[];
  defaultBrokerage: string;
  onClose: () => void;
  onToggleConnection: (brokerageId: string) => void;
  onSetDefault: (brokerageId: string) => void;
}

export const BrokerageModal: React.FC<BrokerageModalProps> = ({
  brokerages,
  defaultBrokerage,
  onClose,
  onToggleConnection,
  onSetDefault,
}) => {
  return (
    <div
      className='modal-overlay'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='brokerage-modal-title'
    >
      <div
        className='modal-content modal-large'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-header'>
          <h3 id='brokerage-modal-title'>Manage Brokerages</h3>
          <button
            className='modal-close'
            onClick={onClose}
            aria-label='Close modal'
          >
            ✕
          </button>
        </div>
        <div className='modal-body settings-body'>
          <p className='modal-description'>
            Connect your brokerage accounts to execute copy trades. Your
            credentials are stored securely.
          </p>

          {/* Default Brokerage */}
          {brokerages.some((b) => b.isConnected) && (
            <div className='setting-section'>
              <label className='setting-label'>Default Brokerage</label>
              <p className='setting-description'>
                This brokerage will be pre-selected in the copy trade approval
                modal and when opening stock pages.
              </p>
              <select
                className='brokerage-select'
                value={defaultBrokerage}
                onChange={(e) => onSetDefault(e.target.value)}
                aria-label='Select default brokerage'
              >
                <option value=''>Select default...</option>
                {brokerages
                  .filter((b) => b.isConnected)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.logo} {b.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Brokerage List */}
          <div className='setting-section'>
            <label className='setting-label'>Available Brokerages</label>
            <div className='brokerage-list'>
              {brokerages.map((brokerage) => (
                <div key={brokerage.id} className='brokerage-item'>
                  <div className='brokerage-info'>
                    <span className='brokerage-icon'>{brokerage.logo}</span>
                    <div className='brokerage-details'>
                      <span className='brokerage-title'>{brokerage.name}</span>
                      <span className='brokerage-status'>
                        {brokerage.isConnected ? (
                          <>
                            <span className='status-dot connected'></span>
                            Connected
                          </>
                        ) : (
                          <>
                            <span className='status-dot'></span>
                            Not Connected
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`btn-toggle ${
                      brokerage.isConnected ? 'connected' : ''
                    }`}
                    onClick={() => onToggleConnection(brokerage.id)}
                    aria-label={`${
                      brokerage.isConnected ? 'Disconnect from' : 'Connect to'
                    } ${brokerage.name}`}
                  >
                    {brokerage.isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className='info-box'>
            <strong>Note:</strong> Connections are simulated for demo purposes.
            In production, this would integrate with actual brokerage APIs
            (Alpaca, TD Ameritrade, etc.)
          </div>
        </div>
        <div className='modal-actions'>
          <button className='btn-primary' onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
