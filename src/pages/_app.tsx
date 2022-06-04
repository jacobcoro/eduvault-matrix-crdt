import type { AppProps } from 'next/app';

import 'styles/globals.css';
import { StoreProvider } from 'model/storeContext';
import 'material-icons/iconfont/material-icons.css';
import NavBar from 'components/base/NavBar';
import Footer from 'components/base/Footer';
import ThemeProvider from 'components/base/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <ThemeProvider>
        <div id="app-root" data-theme="light" className="root">
          <NavBar />
          <Component {...pageProps} />
          <Footer />
        </div>
      </ThemeProvider>
    </StoreProvider>
  );
}
export default MyApp;
