import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import AuthLayout from '../components/AuthLayout';
import EmailField from '../components/EmailField';
import PasswordField from '../components/PasswordField';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="text-muted">Sign in to continue to your dashboard.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <EmailField value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center">
        No account? <Link to="/signup">Create one</Link>
      </p>
    </AuthLayout>
  );
}
