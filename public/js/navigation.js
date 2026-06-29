/**
 * Mobile navigation menu controller.
 *
 * Desktop navigation is shown by CSS. On phones, this module toggles the
 * collapsed navigation links and keeps ARIA state in sync with the button.
 */

const menuToggle = document.getElementById('nav-menu-toggle');
const navigation = document.getElementById('primary-navigation');

function setMenuOpen(open) {
  if (!menuToggle || !navigation) return;

  navigation.dataset.open = open ? 'true' : 'false';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });
}
