import { useEffect, useState } from 'react';

const useTheme = () => {
  // This code assumes a Light Mode default (set data-theme="light" on index.html)
  const [theme, setTheme] = useState('light');

  // find initial theme
  useEffect(() => {
    if (
      /* This condition checks whether the user has set a site preference for dark mode OR a OS-level preference for Dark Mode AND no site preference */
      localStorage.getItem('color-mode') === 'dark' ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches &&
        !localStorage.getItem('color-mode'))
    ) {
      // if true, set the site to Dark Mode
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.getElementById('app-root');
    if (!root) return;

    localStorage.setItem('color-mode', newTheme);
    setTheme(newTheme);
    if (root.dataset.theme === newTheme) return;
    root.dataset.theme = newTheme;
  };

  const toggleTheme = () => {
    const root = document.getElementById('app-root');
    if (!root) return;
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme: applyTheme, toggleTheme };
};
export default useTheme;
