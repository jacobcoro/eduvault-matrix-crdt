import dynamic from 'next/dynamic';
import NotesApp from '../components/NotesApp';
const RouteGuard = dynamic(() => import('../components/RouteGuard'), {
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
