import { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import CropIntelligence from './components/tabs/CropIntelligence';
import DiseaseDetection from './components/tabs/DiseaseDetection';
import WeatherForecast from './components/tabs/WeatherForecast';
import DigitalLedger from './components/tabs/DigitalLedger';
import CropAgropedia from './components/tabs/CropAgropedia';
import FarmerForum from './components/tabs/FarmerForum';
import DashboardView from './components/views/DashboardView';
import AdminView from './components/views/AdminView';
import AuthView from './components/views/AuthView';
import { translations } from './constants/translations';
import { setOnUnauthorizedCallback } from './services/api';
import './index.css';

function App() {
  const [lang, setLang] = useState('en');
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('crop');

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');
    if (token && storedEmail) {
      setUser(storedEmail);
      setRole(storedRole);
    }

    // Set callback so any 401 gracefully logs out the user instead of showing errors
    setOnUnauthorizedCallback(() => {
      setUser(null);
      setRole(null);
    });
  }, []);

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setView('home');
  };

  const handleAuthSuccess = ({ email, role }) => {
    setUser(email);
    setRole(role);
    setView('home');
  };

  const currentT = translations[lang] || translations.en;

  const tabs = [
    {
      id: 'crop',
      label: currentT.tabCrop,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: 'disease',
      label: currentT.tabDisease,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      id: 'weather',
      label: currentT.tabWeather,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      ),
    },
    {
      id: 'ledger',
      label: currentT.tabLedger,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: 'agropedia',
      label: currentT.tabAgropedia,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
    },
    {
      id: 'forum',
      label: currentT.tabForum,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar
        lang={lang}
        setLang={setLang}
        view={view}
        setView={setView}
        user={user}
        role={role}
        onLogout={handleLogout}
        t={currentT}
      />

      {/* DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <DashboardView t={currentT} onAuthError={handleLogout} />
      )}

      {/* ADMIN CONSOLE VIEW */}
      {view === 'admin' && (
        <AdminView t={currentT} setView={setView} />
      )}

      {/* AUTH VIEWS (LOGIN / REGISTER) */}
      {(view === 'login' || view === 'register') && (
        <AuthView
          view={view}
          setView={setView}
          onAuthSuccess={handleAuthSuccess}
          t={currentT}
        />
      )}

      {/* WORKSPACE (HOME) TABBED INTERFACE */}
      {view === 'home' && (
        <section style={{ padding: '36px 6%', background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          <div
            style={{
              maxWidth: '1040px',
              margin: '0 auto',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #dadce0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(60,64,67,0.15)',
            }}
          >
            {/* TAB NAVIGATION BAR */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #dadce0',
                background: '#f8f9fa',
                overflowX: 'auto',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: '1 0 auto',
                    padding: '16px 20px',
                    background: activeTab === tab.id ? 'white' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #188038' : '3px solid transparent',
                    color: activeTab === tab.id ? '#188038' : '#5f6368',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: '0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS */}
            <div style={{ padding: '36px' }}>
              {activeTab === 'crop' && <CropIntelligence t={currentT} lang={lang} />}
              {activeTab === 'disease' && <DiseaseDetection t={currentT} />}
              {activeTab === 'weather' && <WeatherForecast t={currentT} />}
              {activeTab === 'ledger' && <DigitalLedger user={user} t={currentT} setView={setView} />}
              {activeTab === 'agropedia' && <CropAgropedia t={currentT} lang={lang} />}
              {activeTab === 'forum' && <FarmerForum user={user} t={currentT} setView={setView} />}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default App;
