
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = 'blue',      // blue | green | amber | red | slate
  badge,              // small pill under the value (admin cards)
  linkTo,
  linkLabel,
  uppercaseLabel = false,
  outlined = false,
  loading = false,
}) {
  return (
    <article className={'stat-card stat-' + tone + (outlined ? ' is-outlined' : '')}>
      <div style={{ minWidth: 0 }}>
        <p className={uppercaseLabel ? 'stat-uppercase' : 'stat-label'}>{label}</p>

        {loading ? (
          <div className="skeleton" style={{ width: 44, height: 26, marginTop: 8 }} aria-hidden="true" />
        ) : (
          <p className="stat-value">{value}</p>
        )}

        {badge && (
          <span className={'badge ' + badge.className} style={{ marginTop: 8 }}>
            {badge.label}
          </span>
        )}
        {caption && !badge && <p className="stat-caption">{caption}</p>}

        {linkTo && (
          <Link to={linkTo} className="stat-link">
            {linkLabel}
            <ArrowUpRight size={12} />
          </Link>
        )}
      </div>

      {Icon && (
        <span className="stat-icon" aria-hidden="true">
          <Icon size={17} />
        </span>
      )}
    </article>
  );
}
