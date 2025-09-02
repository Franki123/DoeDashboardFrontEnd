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
    <div className="dashboard-container">
      <h2 className="dashboard-title">Game Master Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-section">
        <h3 className="section-title">Give Money to Player</h3>
        <form onSubmit={handleGive}>
          <div className="form-group">
            <label className="form-label">
              Select Player:
              <select 
                className="form-select" 
                value={selectedPlayer} 
                onChange={e => setSelectedPlayer(e.target.value)}
              >
                <option value="">Choose a player...</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.id} - Balance: ${p.balance}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              Amount to Give:
              <input 
                className="form-input" 
                type="number" 
                value={amount} 
                onChange={e => setAmount(parseFloat(e.target.value))}
                placeholder="Enter amount to give"
                step="0.01"
                min="0"
              />
            </label>
          </div>
          <button type="submit" disabled={!selectedPlayer} className="btn btn-give">
            Give Money
          </button>
        </form>
      </div>

      <div className="section">
        <h3 className="section-title">All Players</h3>
        {players.length === 0 ? (
          <p>No players found. Players will appear here once they join the game.</p>
        ) : (
          <ul className="list">
            {players.map(p => (
              <li key={p.id} className="list-item">
                <strong>{p.name || p.id}</strong>
                <br />
                Balance: <span className="player-balance">${p.balance}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h3 className="section-title">All Transactions</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet. Transactions will appear here as players send money to each other.</p>
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

export default GameMasterDashboard;
