import type { AppProps } from 'next/app';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import 'styles/globals.css';
import { StoreProvider } from 'model/storeContext';

import NavBar from 'components/base/NavBar';
import Footer from 'components/base/Footer';

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
