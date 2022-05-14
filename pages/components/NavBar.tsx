import useTheme from './useTheme';
import styles from './NavBar.module.scss';
const NavBar = () => {
  const { toggleTheme } = useTheme();
  return (
    <div className={styles.navbar}>
      <button onClick={() => toggleTheme()}>toggle theme</button>
    </div>
  );
};

export default NavBar;
