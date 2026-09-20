import { ShieldUser } from 'lucide-react';
import { APP_NAME } from '../personas';

// Two-column layout for the sign-in, sign-up and authorisation screens.
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="grid place-content-center justify-items-center gap-2 bg-accent-soft p-8 text-center md:p-12">
        <ShieldUser
          aria-hidden="true"
          size={72}
          strokeWidth={1.5}
          className="text-accent"
        />
        <p className="text-3xl font-bold">{APP_NAME}</p>
        <p className="text-lg">One identity. Many personas.</p>
        <p className="hidden max-w-sm text-muted md:block">
          Keep your professional, personal and gaming details apart, and decide
          which apps can see each one.
        </p>
      </aside>
      <main id="main" className="grid place-items-center bg-surface">
        <div className="w-full max-w-md px-6 py-12">{children}</div>
      </main>
    </div>
  );
}
