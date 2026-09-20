import { useEffect, useState } from 'react';
import { AppWindow } from 'lucide-react';
import { api } from '../api';
import PageHead from '../components/PageHead';
import { findPersona } from '../personas';

export default function Grants() {
  const [grants, setGrants] = useState([]);
  const [message, setMessage] = useState('');

  const load = () =>
    api('/consents')
      .then(setGrants)
      .catch((err) => setMessage(err.message));

  useEffect(() => {
    load();
  }, []);

  async function revoke(grant) {
    try {
      await api(`/consents/${grant.id}`, { method: 'DELETE' });
      setMessage(
        `${grant.client_name} can no longer read your ${grant.persona_context} persona.`
      );
      await load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <>
      <PageHead title="Active grants">
        Apps you have allowed to read a persona.
      </PageHead>
      <p role="status" aria-live="polite" className="status">
        {message}
      </p>

      {grants.length === 0 ? (
        <section className="card flex items-center gap-3 text-muted">
          <AppWindow aria-hidden="true" />
          <p>No application has access to your personas.</p>
        </section>
      ) : (
        <ul className="grid gap-3">
          {grants.map((g) => (
            <li
              key={g.id}
              className="card grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:gap-4"
            >
              <div className="grid gap-1">
                <strong>{g.client_name}</strong>
                <span className="text-sm break-all text-muted">
                  {g.registered_domain}
                </span>
              </div>
              <div className="grid justify-items-start gap-1">
                <span className="badge badge-accent">
                  {findPersona(g.persona_context)?.label}
                </span>
                <code className="text-sm">{g.scope}</code>
                <span className="text-sm text-muted">
                  Granted {new Date(g.granted_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => revoke(g)}
                aria-label={`Revoke ${g.client_name}`}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
