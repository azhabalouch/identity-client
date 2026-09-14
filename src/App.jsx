import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import Authorise from './pages/Authorise';
import Dashboard from './pages/Dashboard';
import Developer from './pages/Developer';
import Grants from './pages/Grants';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <p role="status">Loading…</p>;
  if (!user)
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );

  return children;
}

export default function App() {
  const { user, signOut } = useAuth();
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <nav aria-label="Main">
          <strong>Persona ID</strong>
          {user ? (
            <>
              <Link to="/">Personas</Link>
              <Link to="/grants">Active grants</Link>
              <Link to="/developer">Developer</Link>
              <button type="button" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin">Sign in</Link>
              <Link to="/signup">Create account</Link>
            </>
          )}
        </nav>
      </header>

      <main id="main">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/authorise"
            element={
              <RequireAuth>
                <Authorise />
              </RequireAuth>
            }
          />
          <Route
            path="/grants"
            element={
              <RequireAuth>
                <Grants />
              </RequireAuth>
            }
          />
          <Route
            path="/developer"
            element={
              <RequireAuth>
                <Developer />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
