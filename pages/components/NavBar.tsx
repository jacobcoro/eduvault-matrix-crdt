import useTheme from './useTheme';
import styles from './NavBar.module.scss';
import Link from 'next/link';
const NavBar = () => {
  const { toggleTheme } = useTheme();
  return (
    <div className={styles.navbar}>
      <button onClick={() => toggleTheme()}>toggle theme</button>
      <ul className="links" role="navigation">
        <li>
          <Link href="/login">Login</Link>
        </li>
        <li>
          <Link href="/">Home</Link>{' '}
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
