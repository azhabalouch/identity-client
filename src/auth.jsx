import { createContext, useContext, useEffect, useState } from 'react';
import { api, restoreSession, setAccessToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

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
    setUser(data.user);
  }

  async function signOut() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
