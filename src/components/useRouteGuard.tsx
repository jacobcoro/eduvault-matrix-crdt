import { StoreContext } from 'model/storeContext';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

export const useRouteGuard = () => {
  const router = useRouter();
  const store = useContext(StoreContext);
  useEffect(() => {
    const protectedRoutes = ['app'];
    const currentRoute = router.pathname.split('/')[1];
    protectedRoutes.forEach((route) => {
      if (currentRoute.includes(route) && !store.matrixClient) {
        router.push('/login');
      }
    });
  });
};
