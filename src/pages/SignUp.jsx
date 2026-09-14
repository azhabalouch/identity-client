import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

export default function SignUp() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
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
    }
  }

  return (
    <section>
      <h1>Create account</h1>
      <p>
        Your account starts with three personas: Professional, Personal and
        Gaming.
      </p>

      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password (at least 10 characters)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button type="submit">Create account</button>
      </form>
    </section>
  );
}
