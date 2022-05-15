import { useContext } from 'react';
import styles from './index.module.scss';
import { StoreContext } from 'model/storeContext';
import {
  DEV_PASSWORD,
  DEV_USERNAME,
  MATRIX_SERVER,
  TEST_ROOM_ID,
} from 'config';

const Login = () => {
  const { store, login, loginStatus, matrixClient } = useContext(StoreContext);
  const loginData = {
    server: MATRIX_SERVER,
    user: DEV_USERNAME,
    password: DEV_PASSWORD,
    roomAlias: TEST_ROOM_ID,
  };
  return (
    <div className={styles.root}>
      <h1>Login</h1>

      <div>
        <button
          onClick={() => {
            login(loginData);
          }}
        >
          Login
        </button>
        <p>status: {JSON.stringify(loginStatus)}</p>
      </div>
    </div>
  );
};

export default Login;
