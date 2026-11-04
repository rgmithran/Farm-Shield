export default function Navbar({
  lang,
  setLang,
  view,
  setView,
  user,
  role,
  onLogout,
  t,
}) {
  return (
    <header>
      <nav className="navbar" style={{ position: 'relative', zIndex: 10 }}>
        <div
          className="logo"
          onClick={() => setView('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#188038"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          Farm<span>Shield</span>
        </div>

        <ul className="nav-links">
          <li>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setView('home');
              }}
              style={{ color: view === 'home' ? '#188038' : '' }}
            >
              {t.home}
            </a>
          </li>
          {user && (
            <li>
              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setView('dashboard');
                }}
                style={{ color: view === 'dashboard' ? '#188038' : '' }}
              >
                {t.dashboard}
              </a>
            </li>
          )}
          {role === 'admin' && (
            <li>
              <a
                href="#admin"
                onClick={(e) => {
                  e.preventDefault();
                  setView('admin');
                }}
                style={{ color: view === 'admin' ? '#188038' : '' }}
              >
                {t.admin}
              </a>
            </li>
          )}
        </ul>

        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: '#f1f3f4',
              padding: '4px',
              borderRadius: '8px',
              display: 'flex',
              cursor: 'pointer',
              border: '1px solid #dadce0',
            }}
          >
            <span
              onClick={() => setLang('en')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                background: lang === 'en' ? '#188038' : 'transparent',
                color: lang === 'en' ? 'white' : '#5f6368',
                transition: '0.2s',
              }}
            >
              EN
            </span>
            <span
              onClick={() => setLang('ta')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                background: lang === 'ta' ? '#188038' : 'transparent',
                color: lang === 'ta' ? 'white' : '#5f6368',
                transition: '0.2s',
              }}
            >
              தமிழ்
            </span>
          </div>

          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8f9fa',
                padding: '6px 14px',
                borderRadius: '24px',
                border: '1px solid #dadce0',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#188038',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                {user.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: '500', color: '#202124', fontSize: '14px' }}>
                {user.split('@')[0]}
              </span>
              <button
                onClick={onLogout}
                style={{
                  marginLeft: '4px',
                  background: 'none',
                  border: 'none',
                  color: '#d93025',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => setView('login')}
                style={{ background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                {t.login}
              </button>
              <button
                className="register-btn"
                onClick={() => setView('register')}
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                {t.register}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
