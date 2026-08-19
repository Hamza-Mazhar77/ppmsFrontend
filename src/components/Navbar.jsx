/**
 * Top navigation bar - present on every screen in the report screenshots
 * Left: PaperHub brand. Centre: Home / About / Features / Contact / Search
 * Papers. Right: Login + Register for guests, or the user chip and a sign-out
 * button once signed in. On narrow screens the centre links collapse behind a
 * hamburger and the dashboard sidebar toggle appears.
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut, User, Menu, ShieldCheck } from 'lucide-react';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/features', label: 'Features' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ onToggleSidebar, showSidebarToggle = false }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Collapse the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been signed out.');
    navigate('/login', { replace: true });
  };

  // Signed-in students search inside the portal; guests use the public search.
  const searchPath = isAuthenticated && !isAdmin ? '/dashboard/search' : '/search';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {showSidebarToggle && (
          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={19} />
          </button>
        )}

        <Brand to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} />

        <nav className="navbar-links" data-open={menuOpen} aria-label="Main navigation">
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to={searchPath}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <Search size={14} aria-hidden="true" />
            Search Papers
          </NavLink>
        </nav>

        <div className="navbar-actions">
          {!showSidebarToggle && (
            <button
              type="button"
              className="icon-btn nav-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <Menu size={19} />
            </button>
          )}

          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard/profile'} className="user-chip">
                <User size={14} aria-hidden="true" />
                {user.fullName.split(' ')[0]}
                {isAdmin && (
                  <span className="role-tag">
                    <ShieldCheck size={12} aria-hidden="true" />
                    Admin
                  </span>
                )}
              </Link>
              <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Sign out">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
