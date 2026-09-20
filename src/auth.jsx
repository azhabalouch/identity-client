import { createContext, useContext, useEffect, useState } from 'react';
import { api, restoreSession, setAccessToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // After a page reload the token is gone from memory; the cookie restores it.
    restoreSession()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
    const onSignedOut = () => setUser(null);
    window.addEventListener('signed-out', onSignedOut);
    return () => window.removeEventListener('signed-out', onSignedOut);
  }, []);

  async function signIn(email, password) {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setAccessToken(data.access_token);
    setNotice('');
    setUser(data.user);
  }

  // DELETE /users/{id}: the server removes the account and every persona.
  async function deleteAccount() {
    await api(`/users/${user.id}`, { method: 'DELETE' });
    // The refresh cookie is scoped to /api/v1/auth, so logout clears it.
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setNotice('Your account has been deleted.');
    setUser(null); // RequireAuth then sends the browser to the sign-in page
  }

  async function signOut() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, ready, notice, signIn, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
