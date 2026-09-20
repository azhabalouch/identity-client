import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { currentTheme, setTheme } from '../theme';

// One button that switches between light mode and dark mode.
export default function ThemeToggle({ className = '' }) {
  const [theme, setThemeState] = useState(currentTheme);
  const next = theme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${next} mode`;

  function toggle() {
    setTheme(next);
    setThemeState(next);
  }

  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      {theme === 'dark' ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </button>
  );
}
