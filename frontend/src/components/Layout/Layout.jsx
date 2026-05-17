import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout, DEV_MODE } from '../../services/firebase';
import { Shield, Upload, BarChart3, LogOut, Menu, X } from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
  const { user, devLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (DEV_MODE) {
      devLogout();
    } else {
      await logout();
    }
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Upload', icon: Upload },
    { path: '/history', label: 'History', icon: BarChart3 },
  ];

  return (
    <div className="layout">
      {/* Background ambient glow */}
      <div className="layout__ambient" />

      {/* Header */}
      <header className="header glass-panel">
        <div className="header__inner container">
          <Link to="/" className="header__logo" id="nav-logo">
            <Shield className="header__logo-icon" />
            <span className="header__logo-text">
              <span className="text-gradient">AEGIS</span>
            </span>
          </Link>

          {user && (
            <>
              <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    id={`nav-${label.toLowerCase()}`}
                    className={`header__nav-link ${location.pathname === path ? 'header__nav-link--active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="header__actions">
                <div className="header__user">
                  <div className="header__avatar">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="header__email truncate">{user.email}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="btn-logout">
                  <LogOut size={16} />
                </button>
              </div>

              <button
                className="header__mobile-toggle btn btn-ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer__disclaimer">
            ⚖️ AEGIS provides informational insights only and does not constitute legal advice.
            Consult a qualified attorney for legal decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
