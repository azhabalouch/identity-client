import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Developer() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');
  const load = () =>
    api('/clients')
      .then(setClients)
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  async function register(event) {
    event.preventDefault();
    setError('');
    try {
      const client = await api('/clients', {
        method: 'POST',
        body: { client_name: name, registered_domain: domain },
      });
      setCreated(client);
      setName('');
      setDomain('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section>
      <h1>Register an application</h1>
      <form onSubmit={register}>
        <label htmlFor="client-name">Application name</label>
        <input
          id="client-name"
          required
          minLength={3}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="client-domain">Registered domain (origin)</label>
        <input
          id="client-domain"
          required
          placeholder="https://app.example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button type="submit">Register</button>
      </form>
      {created && (
        <div className="card" role="alert">
          <h2>Copy your secret now</h2>
          <p>
            Client ID: <code>{created.client_id}</code>
          </p>
          <p>
            Client secret: <code>{created.client_secret}</code>
          </p>
          <p>{created.note}</p>
          <p>
            Authorisation link for gaming:
            <br />
            <code>{`${window.location.origin}/authorise?client_id=${created.client_id}&persona=gaming&redirect_uri=${created.registered_domain}/callback`}</code>
          </p>
        </div>
      )}
      <h2>Your applications</h2>
      <ul>
        {clients.map((c) => (
          <li key={c.client_id}>
            {c.client_name} — <code>{c.client_id}</code> — {c.registered_domain}
          </li>
        ))}
      </ul>
    </section>
  );
}
