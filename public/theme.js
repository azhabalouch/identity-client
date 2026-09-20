// Runs before the React bundle, so the page never flashes the wrong theme.
// It is a separate file because the Content-Security-Policy blocks inline scripts.
(function () {
  var saved = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {
    // Storage can be blocked (private mode). The system setting is used instead.
  }
  var dark =
    saved === 'dark' ||
    (saved !== 'light' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
