import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

export default function Authorise() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const clientId = params.get('client_id');
  const persona = params.get('persona');
  const scope = params.get('scope') || `read:profile:${persona}`;
  const redirectUri = params.get('redirect_uri') || undefined;
  const [client, setClient] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api(`/clients/${clientId}`),
      api(`/users/${user.id}/personas/${persona}`),
    ])
      .then(([c, p]) => {
        setClient(c);
        setPreview(
          p.attributes.filter((a) => a.visibility_level !== 'private')
        );
      })
      .catch((err) => setError(err.message));
  }, [clientId, persona, user.id]);

  async function approve() {
    try {
      const grant = await api('/consents', {
        method: 'POST',
        body: {
          client_id: clientId,
          persona_context: persona,
          scope,
          redirect_uri: redirectUri,
        },
      });

      if (grant.redirect_to) window.location.assign(grant.redirect_to);
      else navigate('/grants');
    } catch (err) {
      setError(err.message);
    }
  }

  function deny() {
    if (
      redirectUri &&
      client &&
      new URL(redirectUri).origin === client.registered_domain
    ) {
      window.location.assign(
        `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}error=access_denied`
      );
    } else {
      navigate('/');
    }
  }

  if (error)
    return (
      <p role="alert" className="error">
        {error}
      </p>
    );
  if (!client) return <p role="status">Loading…</p>;

  return (
    <section className="card">
      <h1>Allow access?</h1>
      <p>
        <strong>{client.client_name}</strong> ({client.registered_domain}) wants
        to use your <strong>{persona}</strong> persona.
      </p>
      <p>
        Permission requested: <code>{scope}</code>
      </p>
      <h2>It will see</h2>
      <ul>
        {preview.map((a) => (
          <li key={a.attribute_key}>
            {a.label}: {a.attribute_value}
          </li>
        ))}
      </ul>
      <p>
        It will not see your other personas or any private attribute. You can
        withdraw access at any time on the Active grants page.
      </p>
      <button type="button" onClick={approve}>
        Allow
      </button>
      <button type="button" className="secondary" onClick={deny}>
        Deny
      </button>
    </section>
  );
}
