/** 404 page for unknown routes. */
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="container container-narrow">
        <div className="card">
          <div className="card-body">
            <div className="state-block">
              <span className="state-icon" aria-hidden="true">
                <FileQuestion size={24} />
              </span>
              <h1 className="state-title">Page not found</h1>
              <p className="state-text">
                The page you were looking for does not exist or may have been moved.
              </p>
              <Link to="/" className="btn btn-primary">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
