/* Theme toggle (dark/light mode) */
(function() {
  const toggle = document.querySelector('.theme-toggle');
  const html = document.documentElement;

  function getPreferred() {
    const saved = localStorage.getItem('cravin-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('cravin-theme', theme);
  }

  setTheme(getPreferred());

  if (toggle) {
    toggle.addEventListener('click', function() {
      const current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
    if (!localStorage.getItem('cravin-theme')) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });
})();
