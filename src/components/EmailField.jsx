import { Mail } from 'lucide-react';

export default function EmailField({ value, onChange }) {
  return (
    <div className="field">
      <label htmlFor="email" className="label">
        Email address
      </label>
      <div className="relative">
        <Mail
          aria-hidden="true"
          size={18}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="input pl-10"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
