import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth';
import AuthLayout from '../components/AuthLayout';
import { findPersona } from '../personas';

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

  const label = findPersona(persona)?.label || persona;

  if (error)
    return (
      <AuthLayout>
        <p role="alert" className="alert-error">
          {error}
        </p>
      </AuthLayout>
    );
  if (!client)
    return (
      <AuthLayout>
        <p role="status">Loading…</p>
      </AuthLayout>
    );

  return (
    <AuthLayout>
      <ShieldCheck aria-hidden="true" size={40} className="mb-2 text-accent" />
      <h1 className="text-2xl font-bold">Allow access?</h1>
      <p className="mt-2">
        <strong>{client.client_name}</strong> ({client.registered_domain}) wants
        to use your <strong>{label}</strong> persona.
      </p>
      <p className="mt-1 text-sm">
        Permission requested: <code>{scope}</code>
      </p>

      <h2 className="card-title mt-6 mb-2">It will see</h2>
      {preview.length === 0 ? (
        <p className="text-muted">
          No details. Private details are never shared.
        </p>
      ) : (
        <ul className="card py-2">
          {preview.map((a) => (
            <li
              key={a.attribute_key}
              className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 border-t border-line py-2 first:border-t-0"
            >
              <span className="text-sm text-muted">{a.label}</span>
              <span className="break-all">{a.attribute_value}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-muted">
        It will not see your other personas or any private detail. You can
        withdraw access at any time on the Active grants page.
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" className="btn btn-primary" onClick={approve}>
          Allow
        </button>
        <button type="button" className="btn btn-ghost" onClick={deny}>
          Deny
        </button>
      </div>
    </AuthLayout>
  );
}
