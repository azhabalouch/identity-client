import { useEffect, useState } from 'react';
import { api } from '../api';
import PageHead from '../components/PageHead';

const LIST = 'grid gap-x-4 gap-y-2 sm:grid-cols-[9rem_minmax(0,1fr)]';

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
    <>
      <PageHead title="Developer">
        Register an application that will read personas through the API.
      </PageHead>

      <section className="card mb-4">
        <h2 className="card-title">Register an application</h2>
        <form onSubmit={register} className="mt-4 grid max-w-md gap-4">
          <div className="field">
            <label htmlFor="client-name" className="label">
              Application name
            </label>
            <input
              id="client-name"
              className="input"
              required
              minLength={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="client-domain" className="label">
              Registered domain (origin)
            </label>
            <input
              id="client-domain"
              className="input"
              required
              placeholder="https://app.example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}
          <div>
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
        </form>
      </section>

      {created && (
        <section className="card mb-4 border-accent" role="alert">
          <h2 className="card-title mb-3">Copy your secret now</h2>
          <dl className={LIST}>
            <dt className="text-muted">Client ID</dt>
            <dd className="break-all">
              <code>{created.client_id}</code>
            </dd>
            <dt className="text-muted">Client secret</dt>
            <dd className="break-all">
              <code>{created.client_secret}</code>
            </dd>
            <dt className="text-muted">Gaming link</dt>
            <dd className="break-all">
              <code>{`${window.location.origin}/authorise?client_id=${created.client_id}&persona=gaming&redirect_uri=${created.registered_domain}/callback`}</code>
            </dd>
          </dl>
          <p className="mt-3 text-sm">{created.note}</p>
        </section>
      )}

      <section className="card">
        <h2 className="card-title mb-2">Your applications</h2>
        {clients.length === 0 ? (
          <p className="text-muted">You have not registered an application.</p>
        ) : (
          <ul>
            {clients.map((c) => (
              <li
                key={c.client_id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3 first:border-t-0"
              >
                <span className="grid">
                  <strong>{c.client_name}</strong>
                  <span className="text-sm text-muted">
                    {c.registered_domain}
                  </span>
                </span>
                <code className="text-sm break-all">{c.client_id}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
