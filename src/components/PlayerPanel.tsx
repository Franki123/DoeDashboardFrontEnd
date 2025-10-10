import { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  balance?: number;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  memo?: string;
}

interface PlayerPanelProps {
  currentPlayer: any;
  onSendMoney: (destinationId: string, amount: number, memo: string) => Promise<void>;
  players: Player[];
  transactions: Transaction[];
  playerBalance: number;
}

export const PlayerPanel = ({
  currentPlayer,
  onSendMoney,
  players,
  transactions,
  playerBalance
}: PlayerPanelProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMoney = async () => {
    if (!selectedPlayer) {
      setError('Please select a player');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      await onSendMoney(selectedPlayer, amountNum, memo);
      setAmount('');
      setMemo('');
      setSelectedPlayer('');
    } catch (err: any) {
      setError(err.message || 'Failed to send money');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>Player Panel</h2>

      {/* Player Balance */}
      <div style={{
        padding: '15px',
        backgroundColor: '#e8f5e9',
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#1b5e20' }}>Your Balance</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
          ${playerBalance.toFixed(2)}
        </div>
      </div>

      {/* Other Players List */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#000' }}>Other Players</h3>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            marginBottom: '10px'
          }}
        >
          <option value="">Select a player...</option>
          {players
            .filter(p => p.id !== currentPlayer?.playerId && p.id !== currentPlayer?.id)
            .map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
        </select>
      </div>

      {/* Send Money Form */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        <h3 style={{ marginTop: 0, color: '#000' }}>Send Money</h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#000' }}>
            Amount:
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            disabled={isSending}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#000' }}>
            Memo (optional):
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Note..."
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            disabled={isSending}
          />
        </div>

        <button
          onClick={handleSendMoney}
          disabled={isSending || !selectedPlayer || !amount}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: isSending || !selectedPlayer || !amount ? 'not-allowed' : 'pointer',
            opacity: isSending || !selectedPlayer || !amount ? 0.6 : 1
          }}
        >
          {isSending ? 'Sending...' : 'Send Money'}
        </button>

        {error && (
          <div style={{ marginTop: '10px', color: 'red', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div>
        <h3 style={{ color: '#000' }}>Recent Transactions</h3>
        <div style={{
          border: '1px solid #ccc',
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: '#fafafa'
        }}>
          {transactions.length === 0 ? (
            <div style={{ padding: '15px', color: '#666', fontSize: '14px' }}>
              No transactions yet
            </div>
          ) : (
            transactions.slice(-10).reverse().map((txn) => (
              <div
                key={txn.id}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#000' }}>
                  {txn.from} → {txn.to}: ${txn.amount.toFixed(2)}
                </div>
                {txn.memo && (
                  <div style={{ color: '#555', fontSize: '12px' }}>
                    {txn.memo}
                  </div>
                )}
                <div style={{ color: '#666', fontSize: '12px' }}>
                  {new Date(txn.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
