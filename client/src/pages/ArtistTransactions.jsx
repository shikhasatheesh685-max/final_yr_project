import { useEffect, useState } from 'react';
import { transactionsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ArtistTransactions.css';

const ArtistTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const resp = await transactionsAPI.getMy();
      setTransactions(resp.data);
    } catch (error) {
      console.error('Failed to load transactions', error);
      setMessage('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading transactions..." />;

  return (
    <div className="artist-transactions-container">
      <h1>Transaction History</h1>
      {message && <div className="message error">{message}</div>}
      {transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Order</th>
              <th>From</th>
              <th>Amount</th>
              <th>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>{t.type}</td>
                <td>{t.orderID ? t.orderID._id || t.orderID : '—'}</td>
                <td>{t.fromUser?.name || t.fromUser?.email || 'System'}</td>
                <td>${t.amount}</td>
                <td>${t.balanceAfter ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArtistTransactions;

