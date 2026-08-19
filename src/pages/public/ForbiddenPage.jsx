/**
 * 403 page shown when a student navigates to an administrator URL
 * The redirect here is only the visible half of the rule - the API returns 403
 * for those endpoints regardless of what the browser does.
 */
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForbiddenPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <section className="section">
      <div className="container container-narrow">
        <div className="card">
          <div className="card-body">
            <div className="state-block">
              <span
                className="state-icon"
                style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
                aria-hidden="true"
              >
                <ShieldAlert size={24} />
              </span>
              <h1 className="state-title">Access denied</h1>
              <p className="state-text">
                This area is restricted to PPMS administrators. Your account does not have the required permissions.
              </p>
              <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'} className="btn btn-primary">
                {isAuthenticated ? 'Back to your dashboard' : 'Sign in'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
