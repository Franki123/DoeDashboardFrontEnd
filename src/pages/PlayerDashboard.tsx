import React, { useEffect, useState } from 'react';
import { getPlayerTransactions, sendMoney, Transaction } from '../api';

const PlayerDashboard: React.FC = () => {
  const [playerId, setPlayerId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (playerId) {
      getPlayerTransactions(playerId)
        .then(setTransactions)
        .catch(e => setError(e.message));
    }
  }, [playerId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMoney(playerId, toId, amount);
      setToId('');
      setAmount(0);
      const tx = await getPlayerTransactions(playerId);
      setTransactions(tx);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Player Dashboard</h2>
      <div>
        <label>
          Player ID:
          <input value={playerId} onChange={e => setPlayerId(e.target.value)} />
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSend} style={{ marginTop: '1rem' }}>
        <div>
          <label>
            To Player ID:
            <input value={toId} onChange={e => setToId(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Amount:
            <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
          </label>
        </div>
        <button type="submit" disabled={!playerId}>Send</button>
      </form>
      <h3>Transactions</h3>
      <ul>
        {transactions.map(t => (
          <li key={t.id}>{t.fromPlayerId} sent {t.amount} to {t.toPlayerId} at {t.timestamp}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerDashboard;
