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
    <div>
      <h2>Viewer Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {transactions.map(t => (
          <li key={t.id}>{t.fromPlayerId} sent {t.amount} to {t.toPlayerId} at {t.timestamp}</li>
        ))}
      </ul>
    </div>
  );
};

export default ViewerDashboard;
