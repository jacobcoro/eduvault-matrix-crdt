import 'styles/globals.css';
import type { AppProps } from 'next/app';
import NavBar from 'components/NavBar';
import { StoreProvider } from 'model/storeContext';
import Footer from 'components/Footer';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <div id="app-root" data-theme="light" className="root">
        <NavBar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </StoreProvider>
  );
}
export default MyApp;
