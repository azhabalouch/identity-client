import { useState } from 'react';
import { useAuth } from '../auth';

// Account erasure (DELETE /api/v1/users/{id}). The user types their email
// first, so one stray click cannot remove the whole identity.
export default function DeleteAccount() {
  const { user, deleteAccount } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const matches =
    confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  async function submit(event) {
    event.preventDefault();
    if (!matches) return;
    setError('');
    setBusy(true);
    try {
      await deleteAccount();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section
      className="card mt-4 border-danger"
      aria-labelledby="delete-account-title"
    >
      <h2 id="delete-account-title" className="card-title mb-2">
        Delete account
      </h2>
      <p className="mb-4 text-muted">
        This removes your three personas, every name on record, all app grants
        and any apps you registered as a developer. Connected apps lose access
        straight away. You cannot undo this.
      </p>

      <form onSubmit={submit} className="grid gap-3 sm:max-w-md">
        <div className="field">
          <label htmlFor="confirm-email" className="label">
            Type your email to confirm
          </label>
          <input
            id="confirm-email"
            type="email"
            className="input"
            autoComplete="off"
            spellCheck={false}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="alert-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          className={`btn btn-danger justify-self-start ${busy ? '' : 'disabled:cursor-not-allowed'}`}
          disabled={!matches || busy}
        >
          {busy ? 'Deleting account…' : 'Delete account'}
        </button>
      </form>
    </section>
  );
}
