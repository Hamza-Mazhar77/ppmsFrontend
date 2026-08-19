/**
 * Profile 
 * A hero card with the avatar, name, email and the ROLE / STATUS badges, then a
 * read-only summary of the profile. Editing is limited to the name and phone
 * number: college, degree program, role and account status are set by
 * registration or by an administrator and cannot be changed here (the API
 * rejects them too).
 */
import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Pencil,
  LogOut,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { Field, TextInput } from '../../components/FormField';
import { userApi } from '../../services/ppms.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { initialOf, passwordStrength, STRENGTH_LABELS, STRENGTH_CLASSES } from '../../utils/format';

export default function ProfilePage() {
  const { user, applyUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const openEdit = () => {
    setForm({ fullName: user?.fullName || '', phone: user?.phone || '' });
    setFormError('');
    setEditOpen(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const response = await userApi.updateProfile(form);
      applyUser(response.data.user);
      toast.success('Profile updated successfully.');
      setEditOpen(false);
    } catch (apiError) {
      setFormError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setFormError('');

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await userApi.changePassword(passwordForm);
      toast.success('Password changed successfully.');
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (apiError) {
      setFormError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('You have been signed out.');
    navigate('/login', { replace: true });
  };

  const fields = [
    { label: 'Full Name', value: user?.fullName, icon: User },
    { label: 'Email Address', value: user?.email, icon: Mail },
    { label: 'Phone Number', value: user?.phone || 'Not provided', icon: Phone },
    { label: 'College Name', value: user?.collegeName, icon: Building2 },
    { label: 'Degree Program', value: user?.programName, icon: GraduationCap, wide: true },
  ];

  const strength = passwordStrength(passwordForm.password);

  return (
    <>
      <section className="profile-hero">
        <span className="avatar avatar-square avatar-lg" aria-hidden="true">
          {initialOf(user?.fullName)}
        </span>
        <div>
          <h1 className="profile-name">{user?.fullName}</h1>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-badges">
            <span className="badge badge-info">Role: {user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
            <span className={'badge ' + (user?.isSuspended ? 'badge-rejected' : 'badge-approved')}>
              Status: {user?.isSuspended ? 'Suspended' : 'Active'}
            </span>
            {user?.isVerified && (
              <span className="badge badge-neutral">
                <ShieldCheck size={12} aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Student Profile Information</h2>
            <p className="card-subtitle">
              Your college and degree program are applied automatically to every paper you upload.
            </p>
          </div>
        </div>

        <div className="card-body stack gap-4">
          <div className="profile-grid">
            {fields.map(({ label, value, icon: Icon, wide }) => (
              <div key={label} className="detail-item" style={wide ? { gridColumn: '1 / -1' } : undefined}>
                <p className="detail-label">{label}</p>
                <p className="detail-value">
                  <Icon size={13} aria-hidden="true" />
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="row gap-2 wrap">
            <button type="button" className="btn btn-primary" onClick={openEdit}>
              <Pencil size={15} />
              Edit Profile
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { setFormError(''); setPasswordOpen(true); }}>
              <KeyRound size={15} />
              Change Password
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* --- Edit profile ------------------------------------------------- */}
      <Modal
        open={editOpen}
        title="Edit Profile"
        subtitle="You can update your display name and phone number."
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="edit-profile-form" className="btn btn-primary" disabled={saving}>
              {saving && <span className="btn-spinner" aria-hidden="true" />}
              Save changes
            </button>
          </>
        }
      >
        <form id="edit-profile-form" onSubmit={saveProfile} className="stack gap-4" noValidate>
          {formError && (
            <div className="alert alert-danger" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <Field id="edit-fullName" label="Full Name" required>
            <TextInput
              id="edit-fullName"
              icon={User}
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              autoComplete="name"
            />
          </Field>

          <Field id="edit-phone" label="Phone Number" hint="Leave blank to remove your phone number.">
            <TextInput
              id="edit-phone"
              icon={Phone}
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="0349-1234567"
              autoComplete="tel"
            />
          </Field>

          <div className="alert alert-info">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>
              College, degree program, role and account status cannot be changed here. Contact the administrator if any
              of them is wrong.
            </span>
          </div>
        </form>
      </Modal>

      {/* --- Change password --------------------------------------------- */}
      <Modal
        open={passwordOpen}
        title="Change Password"
        subtitle="Enter your current password, then choose a new one."
        onClose={() => setPasswordOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setPasswordOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="change-password-form" className="btn btn-primary" disabled={saving}>
              {saving && <span className="btn-spinner" aria-hidden="true" />}
              Change password
            </button>
          </>
        }
      >
        <form id="change-password-form" onSubmit={savePassword} className="stack gap-4" noValidate>
          {formError && (
            <div className="alert alert-danger" role="alert">
              <span>{formError}</span>
            </div>
          )}

          <Field id="currentPassword" label="Current Password" required>
            <TextInput
              id="currentPassword"
              icon={KeyRound}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              autoComplete="current-password"
            />
          </Field>

          <Field id="newPassword" label="New Password" required>
            <TextInput
              id="newPassword"
              icon={KeyRound}
              type="password"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </Field>

          {passwordForm.password && (
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
            id="confirmNewPassword"
            label="Confirm New Password"
            required
            error={
              passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword
                ? 'Passwords do not match.'
                : ''
            }
          >
            <TextInput
              id="confirmNewPassword"
              icon={KeyRound}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              autoComplete="new-password"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
