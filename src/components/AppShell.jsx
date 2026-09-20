import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  AppWindow,
  CodeXml,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldUser,
  X,
} from 'lucide-react';
import { useAuth } from '../auth';
import { APP_NAME, PERSONAS } from '../personas';
import Avatar from './Avatar';

const MAIN_LINKS = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/identity', label: 'Identity', Icon: Fingerprint },
];
const APP_LINKS = [
  { to: '/grants', label: 'Active grants', Icon: AppWindow },
  { to: '/developer', label: 'Developer', Icon: CodeXml },
];

// NavLink adds the active style to the link for the current page.
const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 no-underline ${
    isActive
      ? 'bg-accent-soft font-semibold text-accent'
      : 'text-ink hover:bg-soft'
  }`;

function Heading({ children }) {
  return (
    <p className="mx-3 mt-5 mb-1 text-xs font-semibold text-muted">
      {children}
    </p>
  );
}

export default function AppShell() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = (list) =>
    list.map(({ to, label, Icon, end }) => (
      <NavLink key={to} to={to} end={end} className={linkClass} onClick={close}>
        <Icon aria-hidden="true" size={18} />
        {label}
      </NavLink>
    ));

  return (
    <div className="grid min-h-screen md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-10 focus:bg-surface focus:p-2"
      >
        Skip to content
      </a>

      <aside className="border-b border-line bg-surface px-3 py-4 md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-2 pb-3">
          <span className="flex items-center gap-2 text-lg font-bold">
            <ShieldUser aria-hidden="true" size={26} className="text-accent" />
            {APP_NAME}
          </span>
          <button
            type="button"
            className="icon-btn md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="side-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav
          id="side-nav"
          aria-label="Main"
          className={`${open ? 'grid' : 'hidden'} gap-0.5 md:grid`}
        >
          {links(MAIN_LINKS)}
          <Heading>Profile management</Heading>
          {links(
            PERSONAS.map((p) => ({
              to: `/personas/${p.context}`,
              label: p.label,
              Icon: p.Icon,
            }))
          )}
          <Heading>Apps</Heading>
          {links(APP_LINKS)}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-end gap-4 border-b border-line bg-surface px-4 py-3 md:px-8">
          <span className="flex min-w-0 items-center gap-2 font-semibold">
            <Avatar name={user.email} />
            <span className="hidden truncate sm:inline">{user.email}</span>
          </span>
          <button type="button" className="btn btn-ghost" onClick={signOut}>
            <LogOut aria-hidden="true" size={18} />
            Sign out
          </button>
        </header>
        <main id="main" className="max-w-6xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
