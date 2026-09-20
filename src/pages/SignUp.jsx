import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import AuthLayout from '../components/AuthLayout';
import EmailField from '../components/EmailField';
import PasswordField from '../components/PasswordField';
import { PERSONAS } from '../personas';

export default function SignUp() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    // Checked in the browser only. The API still receives email and password.
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api('/users', { method: 'POST', body: { email, password } });
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.status === 409
          ? 'An account with this email already exists.'
          : err.message
      );
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="text-muted">
        Your account starts with three personas:{' '}
        {PERSONAS.map((p) => p.label).join(', ')}.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <EmailField value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField
          id="password"
          label="Password (at least 10 characters)"
          autoComplete="new-password"
          minLength={10}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          minLength={10}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && (
          <p role="alert" className="alert-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={busy}
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
