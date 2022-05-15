import { useContext, useState } from 'react';
import styles from './index.module.scss';
import { LoginStatus, StoreContext } from 'model/storeContext';
import {
  DEV_PASSWORD,
  DEV_USERNAME,
  MATRIX_SERVER,
  TEST_ROOM_ID,
} from 'config';
import { useRouter } from 'next/router';

const Login = () => {
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('initial');
  const onSetLoginStatus = (status: LoginStatus) => {
    setLoginStatus(status);
    if (status === 'ok') router.push('/app');
  };
  const router = useRouter();
  const { store, login, matrixClient } = useContext(StoreContext);
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
            login(loginData, onSetLoginStatus as any);
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
