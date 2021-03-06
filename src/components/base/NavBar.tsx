import styles from './NavBar.module.scss';
import Link from 'next/link';
import { Moon, Sun } from '@styled-icons/fa-solid';
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
const NavBar = () => {
  const { toggleTheme, theme } = useContext(ThemeContext);
  return (
    <div className={styles.root}>
      <nav>
        <button onClick={() => toggleTheme()} className={styles.iconButton}>
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
        <ul className="links" role="navigation">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/notes-app">Notes</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
