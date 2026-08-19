/**
 * About page - explains the problem PPMS solves and how the system is built.
 * Uses the same design language as the rest of the site.
 */
import { CheckCircle2, Layers, Database, Cloud } from 'lucide-react';

const PROBLEMS = [
  'Past papers sit in personal folders or are handed down informally from senior students to juniors.',
  'Students depend on other people to share papers, and they are rarely available when revision starts.',
  'Papers received informally have no guarantee of quality, completeness or accuracy.',
  'Without a central repository there is no way to search for a specific course, year or semester.',
];

const SOLUTIONS = [
  'One centralized repository holding every paper together with rich, structured metadata.',
  'Keyword search combined with filters for course, code, semester, year, paper type, program and college.',
  'Any registered student can contribute, so the collection grows with the student community.',
  'Administrator moderation removes duplicates and low-quality scans before a paper is published.',
];

const LAYERS = [
  {
    icon: Layers,
    title: 'Presentation layer',
    text: 'A responsive React single-page application that runs in any modern browser and talks to the server over a REST API.',
  },
  {
    icon: Database,
    title: 'Application and data layer',
    text: 'A Node.js and Express REST API with JWT authentication, backed by MongoDB through Mongoose for users and paper metadata.',
  },
  {
    icon: Cloud,
    title: 'Cloud storage',
    text: 'The PDF files themselves live in Firebase Cloud Storage. The database keeps only the reference, which keeps queries fast.',
  },
];

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">About PaperHub (PPMS)</h1>
          <p className="section-lead">
            The Past Papers Management System is a web application that gives students of Quaid-i-Azam University
            affiliated colleges one organised place to store, find and share past examination papers.
          </p>
        </div>

        <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <article className="card">
            <div className="card-header">
              <h2 className="card-title">The problem</h2>
            </div>
            <div className="card-body">
              <ul className="info-list">
                {PROBLEMS.map((item) => (
                  <li key={item} className="info-item">
                    <CheckCircle2 size={15} style={{ color: 'var(--danger)' }} aria-hidden="true" />
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="card">
            <div className="card-header">
              <h2 className="card-title">The solution</h2>
            </div>
            <div className="card-body">
              <ul className="info-list">
                {SOLUTIONS.map((item) => (
                  <li key={item} className="info-item">
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>

        <div className="section-head mt-6" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">How the system is built</h2>
          <p className="section-lead">
            PPMS follows a three-tier client-server architecture, keeping presentation, business logic and storage
            cleanly separated.
          </p>
        </div>

        <div className="feature-grid">
          {LAYERS.map(({ icon: Icon, title, text }) => (
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
  );
}
