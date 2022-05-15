import dynamic from 'next/dynamic';
import { useRouteGuard } from './_app';
const NotesApp = dynamic(() => import('../components/NotesApp'), {
  ssr: false,
});
const App = () => {
  useRouteGuard();

  return <NotesApp />;
};

export default App;
