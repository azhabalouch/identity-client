import { useEffect, useState } from 'react';
import { api } from '../api';

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
    <section>
      <h1>Active grants</h1>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {grants.length === 0 ? (
        <p>No application has access to your personas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Application</th>
              <th>Persona</th>
              <th>Permission</th>
              <th>Granted</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {grants.map((g) => (
              <tr key={g.id}>
                <td>
                  {g.client_name}
                  <br />
                  <small>{g.registered_domain}</small>
                </td>
                <td>{g.persona_context}</td>
                <td>
                  <code>{g.scope}</code>
                </td>
                <td>{new Date(g.granted_at).toLocaleDateString('en-GB')}</td>
                <td>
                  <button type="button" onClick={() => revoke(g)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
