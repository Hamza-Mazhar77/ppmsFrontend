/**
 * Registration OTP verification
 * Reached automatically after registering. The email arrives in router state,
 * but the field stays editable so a returning user can verify without
 * registering again. A live countdown shows when the code expires and when a
 * resend becomes available.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import OtpInput from '../../components/OtpInput';
import { Field, TextInput } from '../../components/FormField';
import { authApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';

const RESEND_COOLDOWN_SECONDS = 60;

/** Seconds -> m:ss. */
function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  return minutes + ':' + String(seconds % 60).padStart(2, '0');
}

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(location.state?.email ? RESEND_COOLDOWN_SECONDS : 0);
  const [expiresAt, setExpiresAt] = useState(location.state?.otpExpiresAt || null);
  const [expiresIn, setExpiresIn] = useState(0);

  // One timer drives both countdowns.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setResendIn((current) => (current > 0 ? current - 1 : 0));
      if (expiresAt) {
        const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
        setExpiresIn(remaining);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email) {
      setError('Enter the email address you registered with.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the 6-digit verification code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.verifyOtp({ email, code });
      toast.success('OTP verified successfully. You can now sign in.');
      navigate('/login', { replace: true });
    } catch (apiError) {
      setError(apiError.message);
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setResending(true);
    setError('');
    try {
      const response = await authApi.resendOtp(email);
      setExpiresAt(response.data.otpExpiresAt);
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setCode('');
      toast.success('A new verification code has been sent to your email.');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <MailCheck size={22} />
          </span>
          <h1 className="auth-title">Verify Your Account</h1>
          <p className="auth-subtitle">
            Enter the 6-digit verification code we emailed to activate your PaperHub account.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }} role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="stack gap-5" noValidate>
          <Field id="verify-email" label="Email Address" required>
            <TextInput
              id="verify-email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@qau.edu.pk"
              autoComplete="email"
            />
          </Field>

          <div className="form-field">
            <span className="form-label" id="otp-label">
              Verification Code<span className="required" aria-hidden="true">*</span>
            </span>
            <div role="group" aria-labelledby="otp-label">
              <OtpInput value={code} onChange={setCode} disabled={submitting} />
            </div>
            {expiresIn > 0 && (
              <p className="otp-meta">
                This code expires in <strong>{formatCountdown(expiresIn)}</strong>.
              </p>
            )}
            {expiresAt && expiresIn === 0 && (
              <p className="otp-meta">This code has expired. Please request a new one.</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Verifying...
              </>
            ) : (
              <>
                Verify Account
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={resend}
            disabled={resending || resendIn > 0}
          >
            {resending ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                {resendIn > 0 ? 'Resend code in ' + resendIn + 's' : 'Resend verification code'}
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already verified? <Link to="/login">Sign in to PPMS</Link>
        </p>
      </div>
    </div>
  );
}
