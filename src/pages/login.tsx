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
import LoginForm from 'components/LoginForm';
import { LoginData } from 'model/utils';

const Login = () => {
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('initial');
  const onSetLoginStatus = (status: LoginStatus) => {
    setLoginStatus(status);
    if (status === 'ok') router.push('/app');
  };
  const router = useRouter();
  const { login } = useContext(StoreContext);
  const initialLoginData: LoginData = {
    // TODO: create room
    baseUrl: MATRIX_SERVER,
    userId: DEV_USERNAME, // these will be empty in prod. This speeds up dev time
    password: DEV_PASSWORD,
    roomAlias: TEST_ROOM_ID,
  };
  const [loginData, setLoginData] = useState(initialLoginData);
  const handleLogin = () => {
    login(loginData, onSetLoginStatus as any);
  };
  return (
    <div className={styles.root}>
      <h1>Login</h1>
      <LoginForm
        handleLogin={handleLogin}
        loginStatus={loginStatus}
        loginData={loginData}
        setLoginData={setLoginData}
      />
    </div>
  );
};

export default Login;
