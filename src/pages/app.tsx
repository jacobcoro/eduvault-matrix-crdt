import NotesApp from 'components/NotesApp';
import { useRouteGuard } from './_app';

const App = () => {
  useRouteGuard();

  return <NotesApp />;
};

export default App;
