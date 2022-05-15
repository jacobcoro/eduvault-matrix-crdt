import { Note } from 'model';
import { StoreContext } from 'model/storeContext';
import { useContext } from 'react';
import { ulid } from 'ulid';

const NotesApp = () => {
  const { store } = useContext(StoreContext);

  const createNote = () => {
    const id = ulid();
    const newNote: Note = {
      text: 'hello',
      _id: id,
      _created: new Date().getTime(),
      _updated: new Date().getTime(),
    };
    console.log({ newNote });
    store.notes[id] = newNote;
  };

  return (
    <div>
      <h1>Notes</h1>
      <button onClick={() => createNote()}> Create Note</button>
      {JSON.stringify(store.notes)}
      <div>
        {Object.keys(store.notes).map((id) => (
          <div key={id}>{store.notes[id].text}</div>
        ))}
      </div>
    </div>
  );
};
export default NotesApp;
