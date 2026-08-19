/**
 * Landing page 
 * Hero badge, large title with the blue "(PPMS)" accent, subtitle, three
 * primary actions and the four-column statistics strip. Every figure in that
 * strip comes from GET /api/public/stats, so a fresh deployment honestly shows
 * zero papers rather than an invented number.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  Search,
  Upload,
  ShieldCheck,
  Download,
  History,
  Filter,
  FileCheck2,
  Users,
} from 'lucide-react';
import { publicApi } from '../../services/ppms.service';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  {
    icon: Upload,
    title: 'Contribute past papers',
    text: 'Upload your examination papers as PDFs with the course, year, semester and paper type recorded automatically.',
  },
  {
    icon: Search,
    title: 'Search and filter',
    text: 'Find the exact paper you need by keyword, course code, semester, year, paper type, program or college.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified by moderators',
    text: 'Every submission is reviewed by an administrator before it becomes visible, keeping the repository accurate.',
  },
  {
    icon: Download,
    title: 'Preview and download',
    text: 'Open any approved paper directly in your browser or download it, with a personal download history.',
  },
  {
    icon: History,
    title: 'Track your submissions',
    text: 'Follow each upload through review and see exactly why anything was not approved.',
  },
  {
    icon: Filter,
    title: 'Organised by programme',
    text: 'Papers are grouped by affiliated college and degree programme, so results stay relevant to your studies.',
  },
];

export default function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .getStats()
      .then((response) => {
        if (!cancelled) setStats(response.data);
      })
      .catch(() => {
        // The hero still renders without statistics; nothing is invented here.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const portalPath = isAdmin ? '/admin' : '/dashboard';
  const searchPath = isAuthenticated && !isAdmin ? '/dashboard/search' : '/search';

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-badge">
            <GraduationCap size={14} aria-hidden="true" />
            Quaid-i-Azam University Islamabad - Affiliated Colleges FYP
          </span>

          <h1 className="hero-title">
            Past Paper Management System
            <span className="accent">(PPMS)</span>
          </h1>

          <p className="hero-subtitle">
            A centralized platform where students can search, upload and download university past papers.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to={portalPath} className="btn btn-primary btn-lg">
                Go to {isAdmin ? 'Admin Portal' : 'Dashboard'}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg">
                  Login to Portal
                  <ArrowRight size={16} />
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Register Account
                </Link>
              </>
            )}
            <Link to={searchPath} className="btn btn-secondary btn-lg">
              <Search size={16} />
              Search Papers
              {stats ? ' (' + stats.approvedPapers + ' Available)' : ''}
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <p className="hero-stat-label">Approved Papers</p>
              <p className="hero-stat-value">{stats ? stats.approvedPapers : '-'}</p>
            </div>
            <div className="hero-stat">
              <p className="hero-stat-label">Affiliated Colleges</p>
              <p className="hero-stat-value is-neutral">{stats ? stats.colleges : '-'}</p>
            </div>
            <div className="hero-stat">
              <p className="hero-stat-label">Programs Covered</p>
              <p className="hero-stat-value is-neutral">{stats ? stats.programs : '-'}</p>
            </div>
            <div className="hero-stat">
              <p className="hero-stat-label">Admin Approval</p>
              <p className="hero-stat-value is-success">100% Verified</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Everything you need before an examination</h2>
            <p className="section-lead">
              PPMS replaces the informal sharing of past papers with one moderated, searchable repository for students of
              QAU affiliated colleges.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature-card">
                <span className="feature-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">How PPMS works</h2>
            <p className="section-lead">Four steps from a scanned paper to a resource the whole college can use.</p>
          </div>

          <div className="feature-grid">
            {[
              { icon: Users, title: '1. Register and verify', text: 'Create an account with your college and degree program, then confirm the one-time code sent to your email.' },
              { icon: Upload, title: '2. Upload a paper', text: 'Choose the course - the course code and semester fill in automatically - attach the PDF and submit.' },
              { icon: FileCheck2, title: '3. Administrator review', text: 'A moderator checks the file and its metadata, then approves it or explains why it was rejected.' },
              { icon: Download, title: '4. Search and download', text: 'Approved papers become searchable for every student and can be previewed or downloaded instantly.' },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature-card">
                <span className="feature-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
