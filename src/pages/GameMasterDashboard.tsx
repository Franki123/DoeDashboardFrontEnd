import React, { useEffect, useState } from 'react';
import { getPlayers, getTransactions, giveMoney, Player, Transaction } from '../api';

const GameMasterDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState('');

  const refresh = () => {
    getPlayers().then(setPlayers).catch(e => setError(e.message));
    getTransactions().then(setTransactions).catch(e => setError(e.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await giveMoney(selectedPlayer, amount);
      setAmount(0);
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Game Master Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleGive} style={{ marginBottom: '1rem' }}>
        <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)}>
          <option value="">Select Player</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name || p.id} - {p.balance}</option>
          ))}
        </select>
        <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
        <button type="submit" disabled={!selectedPlayer}>Give Money</button>
      </form>
      <h3>Players</h3>
      <ul>
        {players.map(p => (
          <li key={p.id}>{p.name || p.id}: {p.balance}</li>
        ))}
      </ul>
      <h3>Transactions</h3>
      <ul>
        {transactions.map(t => (
          <li key={t.id}>{t.fromPlayerId} sent {t.amount} to {t.toPlayerId} at {t.timestamp}</li>
        ))}
      </ul>
    </div>
  );
};

export default GameMasterDashboard;
