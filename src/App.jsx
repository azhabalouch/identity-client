import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import AppShell from './components/AppShell';
import Authorise from './pages/Authorise';
import Developer from './pages/Developer';
import Grants from './pages/Grants';
import Identity from './pages/Identity';
import Overview from './pages/Overview';
import PersonaEditor from './pages/PersonaEditor';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready)
    return (
      <p role="status" className="p-8">
        Loading…
      </p>
    );
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
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/authorise"
        element={
          <RequireAuth>
            <Authorise />
          </RequireAuth>
        }
      />
      {/* Every signed-in page shares the sidebar and top bar in AppShell. */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="identity" element={<Identity />} />
        <Route path="personas/:context" element={<PersonaEditor />} />
        <Route path="grants" element={<Grants />} />
        <Route path="developer" element={<Developer />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
