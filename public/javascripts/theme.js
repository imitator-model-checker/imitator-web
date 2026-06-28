/* eslint no-undef: 0 */

/**
 * Light/dark theme toggle.
 *
 * The effective theme defaults to the system preference. When the user clicks
 * the toggle, an explicit choice is stored in localStorage and applied via the
 * `data-theme` attribute on <html>, overriding the system preference.
 */
(function () {
  const root = document.documentElement;
  const STORAGE_KEY = 'theme';

  // Apply the saved theme immediately (before paint) to avoid a flash of the
  // wrong theme. This runs as soon as the script is parsed in <head>.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      root.setAttribute('data-theme', saved);
    }
  } catch (e) {
    /* ignore storage failures (private mode, etc.) */
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function effectiveTheme() {
    return root.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
  }

  function syncIcons() {
    const isDark = effectiveTheme() === 'dark';
    const sun = document.querySelector('.theme-icon-sun');
    const moon = document.querySelector('.theme-icon-moon');

    // Show the icon for the theme you'd switch *to*.
    if (sun) sun.style.display = isDark ? 'block' : 'none';
    if (moon) moon.style.display = isDark ? 'none' : 'block';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore storage failures (private mode, etc.) */
    }
    syncIcons();
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncIcons();

    const button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', function () {
        setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();
