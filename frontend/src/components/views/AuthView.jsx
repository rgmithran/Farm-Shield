import { useState } from 'react';
import { authApi } from '../../services/api';

export default function AuthView({ view, setView, onAuthSuccess, t }) {
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (view === 'login') {
        const response = await authApi.login(authData);
        const { token, email, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role);
        onAuthSuccess({ email, role });
      } else {
        await authApi.register(authData);
        setSuccessMsg('Registration successful! Please sign in with your credentials.');
        setView('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleType) => {
    setLoading(true);
    setError('');
    const demoEmail = roleType === 'admin' ? 'admin@farm.com' : 'farmer@farm.com';
    const demoPassword = 'farmshield123';

    try {
      const response = await authApi.login({ email: demoEmail, password: demoPassword });
      const { token, email, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
      onAuthSuccess({ email, role });
    } catch (err) {
      setError('Could not auto-login to demo account. Please try manual sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', width: '100%', padding: '40px 0' }}>
      <div
        style={{
          maxWidth: '440px',
          margin: 'auto',
          width: '100%',
          padding: '40px',
          background: 'white',
          border: '1px solid #dadce0',
          borderRadius: '12px',
          boxShadow: '0 2px 6px rgba(60,64,67,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#e6f4ea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#188038"
              strokeWidth="2.5"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h2 style={{ color: '#202124', fontSize: '24px', fontWeight: '500', margin: '0 0 6px 0' }}>
            {view === 'login' ? t.welcomeBack : t.createAccount}
          </h2>
          <p style={{ margin: 0, color: '#5f6368', fontSize: '13px' }}>
            Smart agricultural intelligence powered by MERN stack
          </p>
        </div>

        {/* 1-CLICK QUICK DEMO LOGIN BUTTONS */}
        {view === 'login' && (
          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ 1-Click Evaluator & Demo Sign-In
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('farmer')}
                style={{
                  padding: '9px',
                  background: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🌾 {t.demoFarmer}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('admin')}
                style={{
                  padding: '9px',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  border: '1px solid #d2e3fc',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🛡️ {t.demoAdmin}
              </button>
            </div>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '12px',
              background: '#e6f4ea',
              color: '#137333',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {successMsg}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px',
              background: '#fce8e6',
              color: '#c5221f',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. farmer@farm.com"
              value={authData.email}
              onChange={handleAuthChange}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {t.password}
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={authData.password}
              onChange={handleAuthChange}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '15px' }}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '8px' }}>
            {loading ? 'Authenticating...' : view === 'login' ? t.login : t.register}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#5f6368' }}>
          {view === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setError('');
                  setView('register');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a73e8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: 0,
                }}
              >
                {t.register}
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setError('');
                  setView('login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a73e8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: 0,
                }}
              >
                {t.login}
              </button>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
