import { ConnectStatus } from 'model';
import { StoreContext } from 'model/storeContext';
import { useRouter } from 'next/router';
import { FC, useCallback, useContext, useEffect, useState } from 'react';

const RouteGuard: FC<any> = ({ children }) => {
  const router = useRouter();
  const { loggedIn, login } = useContext(StoreContext);
  const [loginStatus, setLoginStatus] = useState<ConnectStatus>('initial');
  const onSetLoginStatus = useCallback((status: ConnectStatus) => {
    setLoginStatus(status);
  }, []);

  if (loginStatus === 'failed') {
    router.push('/login');
    return null;
  }

  if (loggedIn || loginStatus === 'ok') return <>{children}</>;

  if (loginStatus === 'loading') return <div>...authenticating</div>;

  // if not logged in, but has localStorage, try to login.
  const previousLoginData = localStorage.getItem('loginData');

  if (previousLoginData) {
    const loginData = JSON.parse(previousLoginData);
    login(loginData, onSetLoginStatus);
    return <div>...authenticating</div>;
  } else {
    // if not logged in, and no localStorage, redirect to login page.
    router.push('/login');
    return null;
  }
};
export default RouteGuard;
