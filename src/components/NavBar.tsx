import useTheme from './useTheme';
import styles from './NavBar.module.scss';
import Link from 'next/link';
const NavBar = () => {
  const { toggleTheme } = useTheme();
  return (
    <div className={styles.root}>
      <nav>
        <button onClick={() => toggleTheme()}>toggle theme</button>
        <ul className="links" role="navigation">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/app">App</Link>
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
