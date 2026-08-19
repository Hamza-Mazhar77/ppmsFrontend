/**
 * Shell for the public pages (landing, about, features, contact, public search)
 * and the authentication screens: navbar, page content, footer.
 */
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  const year = new Date().getFullYear();

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" className="public-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer-inner">
          <p>
            &copy; {year} PaperHub &middot; Past Papers Management System (PPMS) &middot; QAU Affiliated Colleges
          </p>
          <nav className="site-footer-links" aria-label="Footer">
            <Link to="/about">About</Link>
            <Link to="/features">Features</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/search">Search Papers</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
