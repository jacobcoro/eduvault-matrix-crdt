import { LoginStatus, StoreContext } from 'model/storeContext';
import { useRouter } from 'next/router';
import { FC, useCallback, useContext, useEffect, useState } from 'react';

const RouteGuard: FC<any> = ({ children }) => {
  const router = useRouter();
  const store = useContext(StoreContext);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('initial');
  const onSetLoginStatus = useCallback((status: LoginStatus) => {
    setLoginStatus(status);
  }, []);

  if (loginStatus === 'failed') {
    router.push('/login');
    return null;
  }

  const loggedIn = loginStatus === 'ok' || !!store.matrixClient;
  if (loggedIn) return <>{children}</>;

  if (loginStatus === 'loading') return <div>...loading</div>;

  // if not logged in, but has localStorage, try to login.
  const previousLoginData = localStorage.getItem('loginData');

  if (previousLoginData) {
    const loginData = JSON.parse(previousLoginData);
    store.login(loginData, onSetLoginStatus);
    return <div>...loading</div>;
  } else {
    // if not logged in, and no localStorage, redirect to login page.
    router.push('/login');
    return null;
  }
};
export default RouteGuard;
