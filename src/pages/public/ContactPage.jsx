/**
 * Contact page
 * The details shown here come from GET /api/public/contact, which reads them
 * from the server configuration (CONTACT_EMAIL / CONTACT_PHONE /
 * CONTACT_ADDRESS). No personal contact details are invented in the code.
 */
import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Info } from 'lucide-react';
import { publicApi } from '../../services/ppms.service';

export default function ContactPage() {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .getContact()
      .then((response) => {
        if (!cancelled) setDetails(response.data);
      })
      .catch(() => {
        if (!cancelled) setDetails({ email: '', phone: '', address: '' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = [
    { icon: Mail, label: 'Email', value: details?.email, href: details?.email ? 'mailto:' + details.email : null },
    { icon: Phone, label: 'Phone', value: details?.phone, href: details?.phone ? 'tel:' + details.phone : null },
    { icon: MapPin, label: 'Address', value: details?.address, href: null },
  ];

  return (
    <section className="section">
      <div className="container container-narrow">
        <div className="section-head">
          <h1 className="section-title">Contact</h1>
          <p className="section-lead">
            For help with your account, a paper that was rejected, or anything else about the repository, contact the
            PPMS administration.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">PPMS Administration</h2>
              <p className="card-subtitle">Past Papers Management System - QAU Affiliated Colleges</p>
            </div>
          </div>

          <div className="card-body stack gap-3">
            {rows.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="detail-item">
                <p className="detail-label">{label}</p>
                <p className="detail-value">
                  <Icon size={14} aria-hidden="true" />
                  {value ? (
                    href ? (
                      <a href={href}>{value}</a>
                    ) : (
                      value
                    )
                  ) : (
                    <span className="text-muted">Not configured</span>
                  )}
                </p>
              </div>
            ))}

            <div className="alert alert-info">
              <Info size={15} aria-hidden="true" />
              <span>
                Papers are reviewed by an administrator before they appear in search results. If one of your uploads was
                rejected, the reason is shown on your Upload History page.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
