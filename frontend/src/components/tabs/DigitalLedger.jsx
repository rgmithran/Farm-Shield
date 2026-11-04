import { useState, useEffect } from 'react';
import { ledgerApi } from '../../services/api';

const EXPENSE_CATEGORIES = [
  { key: 'catSeeds', labelKey: 'catSeeds', color: '#188038' },
  { key: 'catLabor', labelKey: 'catLabor', color: '#1a73e8' },
  { key: 'catFert', labelKey: 'catFert', color: '#f29900' },
  { key: 'catEquip', labelKey: 'catEquip', color: '#9334e6' },
  { key: 'catTrans', labelKey: 'catTrans', color: '#e37400' },
  { key: 'catOther', labelKey: 'catOther', color: '#5f6368' },
];

export default function DigitalLedger({ user, t, setView }) {
  const [ledgerData, setLedgerData] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ category: 'catSeeds', amount: '', description: '' });
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLedger = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setFetchLoading(true);
    setError('');
    try {
      const response = await ledgerApi.getEntries();
      setLedgerData(response.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load ledger records.');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLedger();
    }
  }, [user]);

  const handleLedgerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to log expenses.');
      setView('login');
      return;
    }

    setLoadingLedger(true);
    setError('');
    try {
      const response = await ledgerApi.addEntry(expenseForm);
      setLedgerData(response.data);
      setExpenseForm({ category: 'catSeeds', amount: '', description: '' });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please sign in again.');
        setView('login');
      } else {
        setError(err.response?.data?.message || 'Failed to save expense');
      }
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this expense record from your ledger?')) return;
    try {
      const response = await ledgerApi.deleteEntry(id);
      setLedgerData(response.data);
    } catch (err) {
      alert('Failed to delete expense record.');
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '8px', border: '1px solid #dadce0' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📒</span>
        <h3 style={{ fontSize: '20px', color: '#202124', marginBottom: '8px' }}>Sign in to Access Your Digital Ledger</h3>
        <p style={{ color: '#5f6368', maxWidth: '460px', margin: '0 auto 24px auto', fontSize: '14px' }}>
          Track daily fertilizer costs, labor wages, machinery fuel, and seed purchases. Securely backed by your MongoDB farmer profile.
        </p>
        <button
          className="submit-btn"
          onClick={() => setView('login')}
          style={{ width: 'auto', padding: '12px 32px', fontSize: '15px' }}
        >
          {t.login} / Register
        </button>
      </div>
    );
  }

  const totalExpenses = ledgerData.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div>
      <h2 style={{ color: '#202124', marginBottom: '8px', fontSize: '24px', fontWeight: '400' }}>
        💰 {t.ledgerTitle}
      </h2>
      <p style={{ color: '#5f6368', marginBottom: '28px' }}>{t.ledgerSub}</p>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            background: '#fce8e6',
            color: '#c5221f',
            borderRadius: '6px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{error}</span>
          {error.includes('expired') && (
            <button
              onClick={() => setView('login')}
              style={{ background: '#c5221f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Sign In Again
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* LOG EXPENSE FORM */}
        <div
          style={{
            flex: '1 1 300px',
            background: '#f8f9fa',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #dadce0',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px', color: '#202124' }}>
            {t.addExpense}
          </h3>
          <form onSubmit={handleLedgerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
                {t.expenseCat}
              </label>
              <select
                required
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px', background: 'white' }}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {t[cat.labelKey] || cat.key}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
                {t.amount}
              </label>
              <input
                type="number"
                required
                min="1"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="₹ Amount"
                style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase' }}>
                {t.desc}
              </label>
              <input
                type="text"
                required
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="e.g. Bought DAP fertilizer 50kg"
                style={{ padding: '12px', border: '1px solid #dadce0', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loadingLedger}
              style={{
                padding: '14px',
                background: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {loadingLedger ? 'Saving to MongoDB...' : t.addExpense}
            </button>
          </form>
        </div>

        {/* LEDGER RECORDS & SUMMARY */}
        <div style={{ flex: '2 1 400px' }}>
          <div
            style={{
              padding: '24px',
              background: '#e6f4ea',
              borderRadius: '8px',
              border: '1px solid #ceead6',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  color: '#137333',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {t.totalExpenses}
              </p>
              <h2 style={{ margin: 0, fontSize: '32px', color: '#0d652d', fontWeight: '400' }}>
                ₹{totalExpenses.toLocaleString('en-IN')}
              </h2>
              <span style={{ fontSize: '12px', color: '#137333' }}>
                {ledgerData.length} records recorded
              </span>
            </div>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                    {t.date}
                  </th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                    {t.expenseCat}
                  </th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600' }}>
                    {t.desc}
                  </th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600', textAlign: 'right' }}>
                    {t.amount}
                  </th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #dadce0', fontSize: '12px', color: '#5f6368', fontWeight: '600', textAlign: 'center' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fetchLoading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#5f6368' }}>
                      Loading ledger entries from MongoDB...
                    </td>
                  </tr>
                ) : ledgerData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#5f6368' }}>
                      No expenses logged yet. Add your first record above!
                    </td>
                  </tr>
                ) : (
                  ledgerData.map((item, idx) => (
                    <tr key={item._id || idx} style={{ borderBottom: '1px solid #dadce0' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#5f6368', whiteSpace: 'nowrap' }}>
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#202124' }}>
                        {t[item.category] || item.category}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#5f6368' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#d93025', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        -₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {item._id && (
                          <button
                            onClick={() => handleDeleteExpense(item._id)}
                            title="Delete Record"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#80868b', fontSize: '15px' }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#c5221f')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#80868b')}
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
