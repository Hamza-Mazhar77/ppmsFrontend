/**
 * Student portal shell: navbar on top, light sidebar on
 * the left carrying the student identity block and the STUDENT MENU, content
 * on the right. On tablet/mobile the sidebar becomes a slide-in drawer.
 */
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  Upload,
  Clock,
  Download,
  User,
  Building2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { initialOf } from '../utils/format';

const MENU = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/dashboard/search', label: 'Search Papers', icon: Search },
  { to: '/dashboard/upload', label: 'Upload Paper', icon: Upload },
  { to: '/dashboard/upload-history', label: 'Upload History', icon: Clock },
  { to: '/dashboard/download-history', label: 'Download History', icon: Download },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer after navigating on a small screen.
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar showSidebarToggle onToggleSidebar={() => setDrawerOpen((open) => !open)} />

      <div className="dashboard-body">
        <aside className="sidebar" data-open={drawerOpen} aria-label="Student navigation">
          <div className="sidebar-user">
            <span className="avatar" aria-hidden="true">
              {initialOf(user?.fullName)}
            </span>
            <span className="sidebar-user-info">
              <span className="sidebar-user-name" title={user?.fullName}>
                {user?.fullName}
              </span>
              <span className="sidebar-user-meta" title={user?.programName}>
                {user?.programName}
              </span>
              <span className="sidebar-user-college" title={user?.collegeName}>
                <Building2 size={11} aria-hidden="true" />
                {user?.collegeName}
              </span>
            </span>
          </div>

          <p className="sidebar-section-label">Student Menu</p>
          <nav className="sidebar-nav">
            {MENU.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {drawerOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <main id="main-content" className="dashboard-main">
          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
