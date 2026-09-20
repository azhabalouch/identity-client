import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordField({ id, label, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <Lock
          aria-hidden="true"
          size={18}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="input pr-11 pl-10"
          {...inputProps}
        />
        <button
          type="button"
          className="icon-btn absolute top-1/2 right-1 -translate-y-1/2"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
