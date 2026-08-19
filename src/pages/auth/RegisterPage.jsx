/**
 * Student registration 
 * College and degree program are chosen once, here, from database-driven
 * dropdowns. They are stored on the profile and reused automatically for every
 * later upload, which is why the upload form never asks for them again
 * On success the account exists but is unverified; the user is sent to the OTP
 * screen with their email carried in router state.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FileText, User, Mail, Phone, Building2, GraduationCap, Lock, ArrowRight } from 'lucide-react';
import { Field, TextInput, SelectInput } from '../../components/FormField';
import { LoadingState } from '../../components/States';
import useCatalogOptions from '../../hooks/useCatalogOptions';
import { authApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { passwordStrength, STRENGTH_LABELS, STRENGTH_CLASSES } from '../../utils/format';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { options, loading: loadingOptions, error: optionsError } = useCatalogOptions();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      college: '',
      program: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const strength = passwordStrength(password || '');

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const response = await authApi.register(values);
      toast.success('Registration successful. A verification code has been sent to your email.');
      navigate('/verify-otp', {
        state: { email: response.data.email, otpExpiresAt: response.data.otpExpiresAt },
        replace: true,
      });
    } catch (apiError) {
      setFormError(apiError.message);
      Object.entries(apiError.fieldErrors || {}).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });
    }
  };

  if (loadingOptions) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card-wide">
          <LoadingState label="Loading colleges and degree programs..." />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <FileText size={22} />
          </span>
          <h1 className="auth-title">Student Registration</h1>
          <p className="auth-subtitle">
            Create an account for Quaid-i-Azam University Affiliated Colleges Past Paper Management System
          </p>
        </div>

        {(formError || optionsError) && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }} role="alert">
            <span>{formError || optionsError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="stack gap-4">
          <Field id="fullName" label="Full Name" required error={errors.fullName?.message}>
            <TextInput
              id="fullName"
              icon={User}
              placeholder="e.g. Hamza Mazhar Abbasi"
              autoComplete="name"
              error={errors.fullName}
              {...register('fullName', {
                required: 'Full name is required.',
                minLength: { value: 3, message: 'Full name must be at least 3 characters.' },
              })}
            />
          </Field>

          <div className="form-grid">
            <Field id="email" label="Email Address" required error={errors.email?.message}>
              <TextInput
                id="email"
                icon={Mail}
                type="email"
                placeholder="student@qau.edu.pk"
                autoComplete="email"
                error={errors.email}
                {...register('email', {
                  required: 'Email address is required.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                })}
              />
            </Field>

            <Field
              id="phone"
              label="Phone Number"
              error={errors.phone?.message}
              hint="Optional - you can also sign in with it."
            >
              <TextInput
                id="phone"
                icon={Phone}
                type="tel"
                placeholder="0349-1234567"
                autoComplete="tel"
                error={errors.phone}
                {...register('phone', {
                  pattern: {
                    value: /^(\+92|0)?[\s-]?3\d{2}[\s-]?\d{7}$/,
                    message: 'Enter a valid phone number (e.g. 0349-1234567).',
                  },
                })}
              />
            </Field>
          </div>

          <Field id="college" label="College Name" required error={errors.college?.message}>
            <SelectInput
              id="college"
              icon={Building2}
              error={errors.college}
              {...register('college', { required: 'Please select your college.' })}
            >
              <option value="">Select your college</option>
              {(options?.colleges || []).map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field id="program" label="Degree Program" required error={errors.program?.message}>
            <SelectInput
              id="program"
              icon={GraduationCap}
              error={errors.program}
              {...register('program', { required: 'Please select your degree program.' })}
            >
              <option value="">Select your degree program</option>
              {(options?.programs || []).map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                  {program.code ? ' (' + program.code + ')' : ''}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="form-grid">
            <Field id="password" label="Password" required error={errors.password?.message}>
              <TextInput
                id="password"
                icon={Lock}
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={errors.password}
                {...register('password', {
                  required: 'Password is required.',
                  minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                  validate: {
                    hasLetter: (value) => /[A-Za-z]/.test(value) || 'Include at least one letter.',
                    hasNumber: (value) => /\d/.test(value) || 'Include at least one number.',
                    hasSymbol: (value) => /[^A-Za-z0-9]/.test(value) || 'Include at least one special character.',
                  },
                })}
              />
            </Field>

            <Field id="confirmPassword" label="Confirm Password" required error={errors.confirmPassword?.message}>
              <TextInput
                id="confirmPassword"
                icon={Lock}
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                  validate: (value) => value === password || 'Passwords do not match.',
                })}
              />
            </Field>
          </div>

          {password && (
            <div>
              <div className="strength-meter" aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={'strength-bar ' + (index < strength ? STRENGTH_CLASSES[strength] : '')}
                  />
                ))}
              </div>
              <span className="form-hint">Password strength: {STRENGTH_LABELS[strength]}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Creating your account...
              </>
            ) : (
              <>
                Register Account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in to PPMS</Link>
        </p>
      </div>
    </div>
  );
}
