/**
 * Administrator portal shell 
 * Same structure as the student portal but with the dark navy moderation
 * sidebar: an orange shield mark reading "PPMS Admin / MODERATION PORTAL", the
 * administrator identity card, then MAIN MENU with a live pending-count badge
 * on Manage Papers.
 */
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, FileCheck2, Users, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/ppms.service';
import { initialOf } from '../utils/format';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // Refresh the pending badge on every navigation so it tracks moderation work.
  useEffect(() => {
    let cancelled = false;
    adminApi
      .getDashboard()
      .then((response) => {
        if (!cancelled) setPendingCount(response.data.stats.pending);
      })
      .catch(() => {
        if (!cancelled) setPendingCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const menu = [
    { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
    { to: '/admin/papers', label: 'Manage Papers', icon: FileCheck2, badge: pendingCount },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar showSidebarToggle onToggleSidebar={() => setDrawerOpen((open) => !open)} />

      <div className="dashboard-body">
        <aside className="sidebar sidebar-admin" data-open={drawerOpen} aria-label="Administrator navigation">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark" aria-hidden="true">
              <ShieldCheck size={18} />
            </span>
            <span>
              <span className="sidebar-brand-title">PPMS Admin</span>
              <br />
              <span className="sidebar-brand-sub">Moderation Portal</span>
            </span>
          </div>

          <div className="sidebar-user">
            <span className="avatar" aria-hidden="true">
              {initialOf(user?.fullName)}
            </span>
            <span className="sidebar-user-info">
              <span className="sidebar-user-name" title={user?.fullName}>
                {user?.fullName}
              </span>
              <span className="sidebar-user-meta" title={user?.email}>
                {user?.email}
              </span>
            </span>
          </div>

          <p className="sidebar-section-label">Main Menu</p>
          <nav className="sidebar-nav">
            {menu.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
                {Boolean(badge) && <span className="sidebar-link-badge">{badge} Pending</span>}
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
