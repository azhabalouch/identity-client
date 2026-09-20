import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import Avatar from '../components/Avatar';
import DeleteAccount from '../components/DeleteAccount';
import PageHead from '../components/PageHead';
import { findPersona } from '../personas';

export default function Identity() {
  const { user } = useAuth();
  const [names, setNames] = useState(null);
  const [grants, setGrants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api(`/users/${user.id}/names`), api('/consents')])
      .then(([nameData, grantData]) => {
        setNames(nameData.names);
        setGrants(grantData);
      })
      .catch((err) => setError(err.message));
  }, [user.id]);

  if (error)
    return (
      <p role="alert" className="alert-error">
        {error}
      </p>
    );
  if (!names) return <p role="status">Loading…</p>;

  const legal = names.find((n) => n.name_type === 'legal');
  const displayName = legal?.name_value || user.email;

  return (
    <>
      <PageHead title="Identity">
        Your core account. Each persona is built on top of it.
      </PageHead>

      <section className="card mb-4 flex items-center gap-4">
        <Avatar name={displayName} size="lg" />
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{displayName}</h2>
          <p className="truncate text-muted">{user.email}</p>
        </div>
      </section>

      <section className="card mb-4">
        <h2 className="card-title mb-3">Account details</h2>
        <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <dt className="text-muted">Email</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-muted">Legal name</dt>
          <dd>
            {legal ? (
              legal.name_value
            ) : (
              <>
                Not added.{' '}
                <Link to="/personas/professional">Add it to a persona</Link>
              </>
            )}
          </dd>
          <dt className="text-muted">Names on record</dt>
          <dd>{names.length}</dd>
          <dt className="text-muted">Account ID</dt>
          <dd className="break-all">
            <code className="text-sm">{user.id}</code>
          </dd>
        </dl>
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="card-title">Connected apps</h2>
          <Link to="/grants">Manage</Link>
        </div>
        {grants.length === 0 ? (
          <p className="text-muted">No app can read your personas.</p>
        ) : (
          <ul>
            {grants.map((g) => (
              <li key={g.id} className="flex justify-between gap-4 py-2">
                <strong>{g.client_name}</strong>
                <span className="badge badge-accent">
                  {findPersona(g.persona_context)?.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DeleteAccount />
    </>
  );
}
