const THEME_KEY = 'eigu_theme';

function getTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}

function resolveTheme(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return mode;
}

function applyTheme(mode) {
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle('light', resolved === 'light');
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.theme === mode);
  });
}

function setTheme(mode) {
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
}

applyTheme(getTheme());
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (getTheme() === 'system') applyTheme('system');
});

document.addEventListener('click', e => {
  const opt = e.target.closest('.theme-option');
  if (opt) setTheme(opt.dataset.theme);
});
