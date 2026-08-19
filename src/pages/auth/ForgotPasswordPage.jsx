/**
 * Step 1 of the password reset: request a code
 * The API deliberately answers the same way for a known and an unknown address,
 * so this screen cannot be used to discover which emails are registered.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';
import { Field, TextInput } from '../../components/FormField';
import { authApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.forgotPassword(email);
      toast.info(response.message);
      navigate('/reset-password', { state: { email } });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <KeyRound size={22} />
          </span>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            Enter your registered email address and we will send you a code to set a new password.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }} role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="stack gap-4" noValidate>
          <Field id="forgot-email" label="Email Address" required>
            <TextInput
              id="forgot-email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@qau.edu.pk"
              autoComplete="email"
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Sending code...
              </>
            ) : (
              <>
                Send reset code
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
