import 'styles/globals.css';
import type { AppProps } from 'next/app';
import NavBar from 'components/NavBar';
import { StoreProvider } from 'model/storeContext';

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
