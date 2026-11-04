import { useState, useEffect } from 'react';
import { authApi } from '../../services/api';

export default function DashboardView({ t, onAuthError }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await authApi.getHistory();
        setHistory(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          onAuthError?.();
        } else {
          setError('Failed to load analysis history.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [onAuthError]);

  return (
    <section style={{ minHeight: '70vh', padding: '60px 7%' }}>
      <h2
        style={{
          color: '#202124',
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '28px',
          fontWeight: '400',
        }}
      >
        {t.historyTitle}
      </h2>

      {loading && (
        <p style={{ textAlign: 'center', color: '#5f6368', fontSize: '15px' }}>
          Loading your farm analyses...
        </p>
      )}

      {error && (
        <p style={{ textAlign: 'center', color: '#c5221f', fontSize: '15px' }}>
          {error}
        </p>
      )}

      {!loading && !error && history.length === 0 && (
        <p style={{ textAlign: 'center', color: '#5f6368', fontSize: '15px' }}>
          {t.noHistory}
        </p>
      )}

      {!loading && history.length > 0 && (
        <div
          style={{
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {history.map((record, i) => (
            <div
              key={i}
              className="dashboard-card"
              style={{
                padding: '24px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #dadce0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #dadce0',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                }}
              >
                <h3
                  style={{
                    color: '#202124',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#188038"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {record.location}
                </h3>
                <p style={{ fontSize: '13px', color: '#5f6368', margin: 0 }}>
                  {new Date(record.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                {(record.recommendedCrops || []).map((crop, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      fontSize: '14px',
                    }}
                  >
                    <span style={{ fontWeight: '500', color: '#3c4043' }}>
                      {t.crops[crop.cropName] || crop.cropName}
                    </span>
                    <span style={{ color: '#188038', fontWeight: '600' }}>
                      ₹{crop.expectedProfit?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
