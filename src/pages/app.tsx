import dynamic from 'next/dynamic';
import NotesApp from '../components/notes/NotesApp';
const RouteGuard = dynamic(() => import('../components/base/RouteGuard'), {
  ssr: false,
});
const App = () => {
  return (
    <RouteGuard>
      <NotesApp />
    </RouteGuard>
  );
};

export default App;
