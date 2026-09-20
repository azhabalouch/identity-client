// Theme choice. public/theme.js sets the first value before React starts.
const KEY = 'theme';

export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme); // a display setting only, never a token
  } catch {
    // Storage blocked: the choice still applies until the page is closed.
  }
}
