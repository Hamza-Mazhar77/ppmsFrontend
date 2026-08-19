/**
 * Step 2 of the password reset: submit the code and the new password
 * A successful reset invalidates every outstanding reset code for the account,
 * so a previously emailed code cannot be replayed.
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, ArrowRight } from 'lucide-react';
import OtpInput from '../../components/OtpInput';
import { Field, TextInput } from '../../components/FormField';
import { authApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { passwordStrength, STRENGTH_LABELS, STRENGTH_CLASSES } from '../../utils/format';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Enter the 6-digit reset code sent to your email.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword({ email, code, password, confirmPassword });
      toast.success('Your password has been reset. Please sign in.');
      navigate('/login', { replace: true });
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter the code from your email and choose a new password.</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }} role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="stack gap-4" noValidate>
          <Field id="reset-email" label="Email Address" required>
            <TextInput
              id="reset-email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@qau.edu.pk"
              autoComplete="email"
            />
          </Field>

          <div className="form-field">
            <span className="form-label" id="reset-otp-label">
              Reset Code<span className="required" aria-hidden="true">*</span>
            </span>
            <div role="group" aria-labelledby="reset-otp-label">
              <OtpInput value={code} onChange={setCode} disabled={submitting} autoFocus={false} />
            </div>
          </div>

          <Field id="reset-password" label="New Password" required>
            <TextInput
              id="reset-password"
              icon={Lock}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </Field>

          {password && (
            <div>
              <div className="strength-meter" aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} className={'strength-bar ' + (index < strength ? STRENGTH_CLASSES[strength] : '')} />
                ))}
              </div>
              <span className="form-hint">Password strength: {STRENGTH_LABELS[strength]}</span>
            </div>
          )}

          <Field
            id="reset-confirm"
            label="Confirm New Password"
            required
            error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : ''}
          >
            <TextInput
              id="reset-confirm"
              icon={Lock}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Resetting password...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Need a new code? <Link to="/forgot-password">Request another</Link>
        </p>
      </div>
    </div>
  );
}
