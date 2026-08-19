/**
 * Features page - the core capabilities of PPMS, grouped by module.
 */
import {
  UserPlus,
  ShieldCheck,
  Upload,
  Search,
  Eye,
  Download,
  History,
  Clock,
  FileCheck2,
  Users,
  Lock,
  Filter,
} from 'lucide-react';

const GROUPS = [
  {
    title: 'Accounts and security',
    items: [
      { icon: UserPlus, title: 'Secure registration', text: 'Register with your name, email, phone, college and degree program. Passwords are hashed with bcrypt and never stored in plain text.' },
      { icon: ShieldCheck, title: 'One-time password verification', text: 'A numeric code is emailed to you at sign-up. An account stays inactive until that code is verified.' },
      { icon: Lock, title: 'Role-based access', text: 'Students and administrators see different portals, and every API request is authorised on the server.' },
    ],
  },
  {
    title: 'Contributing papers',
    items: [
      { icon: Upload, title: 'PDF upload with metadata', text: 'Choose a course and the course code and semester fill in from the database. Your college and program come from your profile.' },
      { icon: Clock, title: 'Upload history', text: 'Track every paper you have submitted, its review status, and the reason for any rejection.' },
      { icon: FileCheck2, title: 'Duplicate protection', text: 'Identical files are blocked automatically and similar submissions are flagged for the administrator.' },
    ],
  },
  {
    title: 'Finding and using papers',
    items: [
      { icon: Search, title: 'Keyword search', text: 'Search across course names, course codes, colleges and degree programs from a single search box.' },
      { icon: Filter, title: 'Metadata filters', text: 'Narrow results by course, code, semester, year, paper type, degree program and college, in any combination.' },
      { icon: Eye, title: 'In-browser preview', text: 'Open any approved paper in the browser without downloading it first.' },
      { icon: Download, title: 'Download with history', text: 'Download the original PDF; every download is recorded so you can fetch it again later.' },
      { icon: History, title: 'Download history', text: 'Revisit everything you have downloaded, with a one-click "download again" action.' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { icon: FileCheck2, title: 'Moderation queue', text: 'Review every submission with its full metadata and PDF preview, then approve or reject it with a recorded reason.' },
      { icon: Users, title: 'User management', text: 'View all registered users and suspend or delete an account when necessary.' },
      { icon: ShieldCheck, title: 'Activity overview', text: 'Live counts of pending, approved and rejected papers plus registered users and total downloads.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">Features</h1>
          <p className="section-lead">
            Everything the Past Papers Management System provides, from account creation to administrator moderation.
          </p>
        </div>

        {GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: '2.5rem' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>
              {group.title}
            </h2>
            <div className="feature-grid">
              {group.items.map(({ icon: Icon, title, text }) => (
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
        ))}
      </div>
    </section>
  );
}
