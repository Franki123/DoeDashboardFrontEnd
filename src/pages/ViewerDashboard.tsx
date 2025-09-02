import React, { useEffect, useState } from 'react';
import { getTransactions, Transaction } from '../api';

const ViewerDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(e => setError(e.message));
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Viewer Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="section">
        <h3 className="section-title">All Transactions</h3>
        {transactions.length === 0 ? (
          <p>No transactions found. This view shows all transactions in the system once they start happening.</p>
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

export default ViewerDashboard;
