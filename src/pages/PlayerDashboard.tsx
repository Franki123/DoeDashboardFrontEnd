import React, { useEffect, useState } from 'react';
import { getPlayerTransactions, sendMoney, Transaction } from '../api';

const PlayerDashboard: React.FC = () => {
  const [playerId, setPlayerId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error message when user starts typing
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [playerId, toId, amount]);

  useEffect(() => {
    if (playerId && playerId.trim()) {
      // Clear previous errors
      setError('');
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(playerId.trim())) {
        setError('Player ID must be a valid UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)');
        setTransactions([]);
        return;
      }

      setIsLoadingTransactions(true);
      getPlayerTransactions(playerId.trim())
        .then((txs) => {
          setTransactions(txs);
          setError('');
        })
        .catch((e) => {
          if (e.message.includes('404') || e.message.toLowerCase().includes('not found')) {
            setError('Player not found. Please check your Player ID.');
          } else if (e.message.toLowerCase().includes('network') || e.message.toLowerCase().includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(`Failed to load transactions: ${e.message}`);
          }
          setTransactions([]);
        })
        .finally(() => {
          setIsLoadingTransactions(false);
        });
    } else {
      setTransactions([]);
      setError('');
    }
  }, [playerId]);

  const validateForm = (): string | null => {
    if (!playerId.trim()) {
      return 'Please enter your Player ID';
    }
    
    if (!toId.trim()) {
      return 'Please enter the recipient Player ID';
    }

    if (playerId.trim() === toId.trim()) {
      return 'You cannot send money to yourself';
    }

    // Validate UUID format for both IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(playerId.trim())) {
      return 'Your Player ID must be a valid UUID format';
    }
    
    if (!uuidRegex.test(toId.trim())) {
      return 'Recipient Player ID must be a valid UUID format';
    }

    if (!amount || amount <= 0) {
      return 'Amount must be greater than 0';
    }

    if (amount > 1000000) {
      return 'Amount cannot exceed $1,000,000';
    }

    // Check for reasonable decimal places
    if (amount.toString().split('.')[1]?.length > 2) {
      return 'Amount cannot have more than 2 decimal places';
    }

    return null;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await sendMoney(playerId.trim(), toId.trim(), amount);
      
      // Success! Clear form and show success message
      setToId('');
      setAmount(0);
      setSuccess(`Successfully sent $${amount.toFixed(2)} to ${toId.trim()}`);
      
      // Refresh transactions
      const tx = await getPlayerTransactions(playerId.trim());
      setTransactions(tx);
      
    } catch (e: any) {
      // Handle specific error cases
      const errorMessage = e.message.toLowerCase();
      
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        setError('Insufficient balance. You do not have enough money to complete this transaction.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        if (errorMessage.includes('sender') || errorMessage.includes('from')) {
          setError('Your Player ID was not found. Please check your Player ID.');
        } else {
          setError('Recipient player not found. Please check the recipient Player ID.');
        }
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
        setError('You are not authorized to perform this transaction.');
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        setError('Server error. Please try again later.');
      } else if (errorMessage.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        // Generic error with the actual message
        setError(`Transaction failed: ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Player Dashboard</h2>
      
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">
            Player ID:
            <input 
              className="form-input" 
              value={playerId} 
              onChange={e => setPlayerId(e.target.value)}
              placeholder="Enter your player ID (UUID format)"
              disabled={isLoadingTransactions}
            />
          </label>
          {isLoadingTransactions && (
            <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
              Loading transactions...
            </small>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          borderLeft: '4px solid #28a745',
          fontWeight: '500'
        }}>
          {success}
        </div>
      )}
      
      <div className="form-section">
        <h3 className="section-title">Send Money</h3>
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">
              To Player ID:
              <input 
                className="form-input" 
                value={toId} 
                onChange={e => setToId(e.target.value)}
                placeholder="Recipient player ID (UUID format)"
                disabled={isLoading}
              />
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              Amount:
              <input 
                className="form-input" 
                type="number" 
                value={amount || ''} 
                onChange={e => setAmount(e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Enter amount to send"
                step="0.01"
                min="0.01"
                max="1000000"
                disabled={isLoading}
              />
            </label>
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Maximum: $1,000,000 • Use up to 2 decimal places
            </small>
          </div>
          <button 
            type="submit" 
            disabled={!playerId || !toId || !amount || isLoading || isLoadingTransactions} 
            className="btn"
          >
            {isLoading ? 'Sending...' : 'Send Money'}
          </button>
        </form>
      </div>

      <div className="section">
        <h3 className="section-title">Your Transactions</h3>
        {isLoadingTransactions ? (
          <p>Loading your transactions...</p>
        ) : transactions.length === 0 ? (
          <p>
            {playerId.trim() 
              ? 'No transactions found for this player ID.' 
              : 'Enter your Player ID above to view your transaction history.'
            }
          </p>
        ) : (
          <ul className="list">
            {transactions.map(t => (
              <li key={t.id} className="list-item">
                <strong>{t.fromPlayerId}</strong> sent <span className="transaction-amount">${t.amount}</span> to <strong>{t.toPlayerId}</strong>
                <br />
                <small>{new Date(t.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;
