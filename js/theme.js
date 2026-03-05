/* Theme toggle (dark/light mode) */
(function() {
  var toggles = document.querySelectorAll('.theme-toggle');
  var html = document.documentElement;

  function getPreferred() {
    var saved = localStorage.getItem('cravin-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('cravin-theme', theme);
  }

  setTheme(getPreferred());

  toggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      var current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
    if (!localStorage.getItem('cravin-theme')) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });
})();
