import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppWindow,
  ChevronRight,
  CodeXml,
  Fingerprint,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth';
import PageHead from '../components/PageHead';
import { PERSONAS } from '../personas';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Ring that shows the share of attribute definitions with a value.
function Progress({ percent }) {
  const length = 2 * Math.PI * 20;
  return (
    <svg viewBox="0 0 48 48" className="size-12 flex-none" aria-hidden="true">
      <g transform="rotate(-90 24 24)" fill="none" strokeWidth="5">
        <circle cx="24" cy="24" r="20" className="stroke-line" />
        <circle
          cx="24"
          cy="24"
          r="20"
          className="stroke-gaming"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - percent / 100)}
        />
      </g>
      <text
        x="24"
        y="28"
        textAnchor="middle"
        className="fill-ink text-[11px] font-bold"
      >
        {percent}%
      </text>
    </svg>
  );
}

function StatCard({ to, icon, title, text }) {
  const body = (
    <>
      {icon}
      <span className="grid min-w-0">
        <strong>{title}</strong>
        <span className="text-sm wrap-anywhere text-muted">{text}</span>
      </span>
      {to && <ChevronRight aria-hidden="true" size={18} />}
    </>
  );
  const style =
    'card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3';
  return to ? (
    <Link
      to={to}
      className={`${style} text-ink no-underline hover:border-accent`}
    >
      {body}
    </Link>
  ) : (
    <div className={style}>{body}</div>
  );
}

const QUICK_ACTIONS = [
  { to: '/personas/professional', label: 'Edit a persona', Icon: Pencil },
  { to: '/identity', label: 'View identity details', Icon: Fingerprint },
  { to: '/grants', label: 'Review app access', Icon: AppWindow },
  { to: '/developer', label: 'Register an app', Icon: CodeXml },
];

const round = 'size-9 flex-none rounded-full bg-accent-soft p-2 text-accent';

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Four existing read-only calls. Nothing new is sent to the server.
    Promise.all([
      api(`/users/${user.id}/personas`),
      api('/attribute-definitions'),
      api(`/users/${user.id}/names`),
      api('/consents'),
    ])
      .then(([personas, definitions, names, grants]) =>
        setData({ personas: personas.personas, definitions, names, grants })
      )
      .catch((err) => setError(err.message));
  }, [user.id]);

  if (error)
    return (
      <p role="alert" className="alert-error">
        {error}
      </p>
    );
  if (!data) return <p role="status">Loading…</p>;

  const filled = (context) =>
    data.personas.find((p) => p.context === context)?.attributes.length || 0;
  const total = (context) =>
    data.definitions.filter((d) => d.allowed_context === context).length;
  const filledAll = PERSONAS.reduce((sum, p) => sum + filled(p.context), 0);
  const percent = data.definitions.length
    ? Math.round((filledAll / data.definitions.length) * 100)
    : 0;
  const name =
    data.names.preferred.personal ||
    data.names.preferred.professional ||
    user.email;
  const apps = data.grants.length;

  return (
    <>
      <PageHead title={`${greeting()}, ${name}`}>
        Manage your identity and profiles across all personas.
      </PageHead>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              to="/identity"
              icon={<Fingerprint aria-hidden="true" className={round} />}
              title="Identity"
              text={user.email}
            />
            <StatCard
              to="/grants"
              icon={<AppWindow aria-hidden="true" className={round} />}
              title="Active grants"
              text={`${apps} ${apps === 1 ? 'app' : 'apps'} with access`}
            />
            <StatCard
              icon={<Progress percent={percent} />}
              title="Profile completion"
              text={`${filledAll} of ${data.definitions.length} details added`}
            />
          </div>

          <h2 className="mt-8 mb-3 text-lg font-bold">Your personas</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PERSONAS.map(({ context, label, summary, Icon, text }) => (
              <article key={context} className="card flex flex-col gap-1">
                <span
                  className={`mb-1 grid size-12 place-items-center rounded-full bg-accent-soft ${text}`}
                >
                  <Icon aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold">{label}</h3>
                <p className="text-sm text-muted">{summary}</p>
                <p className="mb-4 text-sm">
                  {filled(context)} of {total(context)} details added
                </p>
                <Link
                  to={`/personas/${context}`}
                  className="btn btn-primary mt-auto"
                  aria-label={`Manage ${label} persona`}
                >
                  Manage
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <section className="card">
            <h2 className="card-title mb-2">Quick actions</h2>
            <ul>
              {QUICK_ACTIONS.map(({ to, label, Icon }) => (
                <li key={to} className="border-t border-line first:border-t-0">
                  <Link
                    to={to}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 text-ink no-underline hover:text-accent"
                  >
                    <Icon aria-hidden="true" size={18} />
                    {label}
                    <ChevronRight aria-hidden="true" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex gap-3 rounded-xl bg-accent-soft p-5 text-sm">
            <ShieldCheck aria-hidden="true" className="flex-none text-accent" />
            <p>
              Apps only see the persona you approve, and never your private
              details. You can withdraw access at any time.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
