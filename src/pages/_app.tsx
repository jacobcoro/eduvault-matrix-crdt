import 'styles/globals.css';
import type { AppProps } from 'next/app';
import NavBar from 'components/NavBar';
import { StoreContext, StoreProvider } from 'model/storeContext';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

export const useRouteGuard = () => {
  const router = useRouter();
  const store = useContext(StoreContext);
  useEffect(() => {
    console.log(store);
    const protectedRoutes = ['app'];
    const currentRoute = router.pathname.split('/')[1];
    protectedRoutes.forEach((route) => {
      console.log({ currentRoute, route });
      if (currentRoute.includes(route) && !store.matrixClient) {
        router.push('/login');
      }
    });
  });
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <div id="app-root" data-theme="light" className="root">
        <NavBar />
        <Component {...pageProps} />
      </div>
    </StoreProvider>
  );
}
export default MyApp;
