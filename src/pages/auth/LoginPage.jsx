/**
 * Student / administrator login
 * The "quick role switcher" from the report screenshot is preserved as an
 * evaluation convenience: it only prefills the identifier field and relabels
 * the card. It grants nothing. The server issues a JWT carrying the role stored
 * on the account, and every admin endpoint re-checks that role, so choosing
 * "Login as Admin" with a student account still signs you in as a student.
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FileText, Mail, Lock, ArrowRight, UserCog, ShieldCheck } from 'lucide-react';
import { Field, TextInput } from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('student'); // affects labels/placeholder only
  const [formError, setFormError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { identifier: '', password: '' } });

  const onSubmit = async (values) => {
    setFormError('');
    setUnverifiedEmail('');
    try {
      const user = await login(values);
      toast.success('Welcome back, ' + user.fullName.split(' ')[0] + '.');

      // Send the user where they were heading, or to their role's dashboard.
      const requested = location.state?.from?.pathname;
      const fallback = user.role === 'admin' ? '/admin' : '/dashboard';
      const target = requested && requested !== '/login' ? requested : fallback;
      navigate(target, { replace: true });
    } catch (apiError) {
      setFormError(apiError.message);
      Object.entries(apiError.fieldErrors || {}).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });
      // An unverified account can jump straight back into the OTP screen.
      if (/not verified/i.test(apiError.message) && values.identifier.includes('@')) {
        setUnverifiedEmail(values.identifier);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <FileText size={22} />
          </span>
          <h1 className="auth-title">{mode === 'admin' ? 'Administrator Login' : 'Student Login'}</h1>
          <p className="auth-subtitle">Past Paper Management System (PPMS) - QAU Affiliated Colleges</p>
        </div>

        <div className="role-switcher">
          <span className="role-switcher-label" id="role-switcher-label">
            Quick Role Switcher (for evaluation):
          </span>
          <div className="role-switcher-buttons" role="group" aria-labelledby="role-switcher-label">
            <button
              type="button"
              className={'role-btn' + (mode === 'student' ? ' active-student' : '')}
              aria-pressed={mode === 'student'}
              onClick={() => {
                setMode('student');
                setValue('identifier', '');
              }}
            >
              <UserCog size={14} aria-hidden="true" />
              Login as Student
            </button>
            <button
              type="button"
              className={'role-btn' + (mode === 'admin' ? ' active-admin' : '')}
              aria-pressed={mode === 'admin'}
              onClick={() => setMode('admin')}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Login as Admin
            </button>
          </div>
          <p className="role-switcher-note">
            This selection only changes the form labels. Your actual permissions come from your account.
          </p>
        </div>

        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }} role="alert">
            <span>
              {formError}
              {unverifiedEmail && (
                <>
                  {' '}
                  <Link to="/verify-otp" state={{ email: unverifiedEmail }}>
                    Verify your account now
                  </Link>
                  .
                </>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="stack gap-4">
          <Field
            id="identifier"
            label={mode === 'admin' ? 'Admin Email Address' : 'Email Address or Phone Number'}
            error={errors.identifier?.message}
          >
            {({ describedBy }) => (
              <TextInput
                id="identifier"
                icon={Mail}
                type="text"
                autoComplete="username"
                placeholder={mode === 'admin' ? 'admin@ppms.com' : 'student@qau.edu.pk or 0349-1234567'}
                aria-describedby={describedBy}
                error={errors.identifier}
                {...register('identifier', { required: 'Enter your email address or phone number.' })}
              />
            )}
          </Field>

          <div className="form-field">
            <div className="row-between">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs">
                Forgot Password?
              </Link>
            </div>
            <TextInput
              id="password"
              icon={Lock}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password}
              {...register('password', { required: 'Your password is required.' })}
            />
            {errors.password && (
              <span className="form-error" role="alert">
                {errors.password.message}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              <>
                Login to PPMS
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Do not have an account? <Link to="/register">Register Student Account</Link>
        </p>
      </div>
    </div>
  );
}
