import { Edit, Trash } from '@styled-icons/fa-solid';
import { useSyncedStore } from '@syncedstore/react';
import Editor, { OnEditorChange } from 'components/Editor';
import { CollectionKey, Documents, Note } from 'model';
import { StoreContext } from 'model/storeContext';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ulid } from 'ulid';
import style from './NotesApp.module.scss';
import PlateEditor from './Editor/PlateEditor';
// const DynamicComponent = dynamic(() => import('./Editor/PlateEditor'));
const NotesApp = () => {
  const { db } = useContext(StoreContext);
  let store =
    db && db.collections.notes[0] ? db.collections.notes[0].store : null;

  const [ready, setReady] = useState(false);
  const connectRoomsOrCreateDefaultRoom = useCallback(async () => {
    if (!db) return null;

    // lookup notes rooms in registry
    const notesRegistry = db.collections.registry[0].store.documents[0].notes;
    // connect each note room
    const notesKeysList = Object.keys(notesRegistry);

    console.log({ notesKeysList });
    if (notesKeysList.length === 0) {
      await db.createAndConnectRoom(
        CollectionKey.notes,
        'notes-default',
        'Default Notes Collection'
      );
    } else {
      const noteRoomsRegistryKeys = Object.keys(
        db.collections.registry[0].store.documents[0].notes
      );
      const noteRoomData = noteRoomsRegistryKeys.map(
        (key) => db.collections.registry[0].store.documents[0].notes[key]
      );
      const promises = noteRoomData.map((room) => {
        return async () => {
          console.log('connecting room', room.roomAlias);
          await db.connectRoom(db.collections.notes[room.roomId]);
        };
      });
      await Promise.all(promises);
    }
  }, [db]);

  useEffect(() => {
    connectRoomsOrCreateDefaultRoom();
  }, [connectRoomsOrCreateDefaultRoom]);

  if (db && db.matrixClient) {
    db.onRoomConnectStatusUpdate = (status, collection) => {
      if (status === 'ok' && collection === 'notes') {
        setReady(true);
      }
    };
  }
  if (!db || !store || JSON.stringify(store) === '{}' || !ready)
    return <div>...loading collection</div>;
  return <NotesAppInternal store={db.collections.notes[0].store.documents} />;
};

const NotesAppInternal = ({ store }: { store: Documents<Note> }) => {
  const syncedStore = useSyncedStore(store);
  const notes = syncedStore ?? {};
  const [noteText, setNoteText] = useState(initialMarkdown);
  const createNote = (text: string) => {
    const id = ulid();
    const newNote: Note = {
      _ref: id,
      text,
      _id: id,
      _created: new Date().getTime(),
      _updated: new Date().getTime(),
    };
    notes[id] = newNote;
  };
  const handleChange: OnEditorChange = (markdown) => {
    // if (markdown) setNoteText(markdown);
  };
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (noteText) createNote(noteText);
    setNoteText('');
  };
  const handleDelete = (note: Note) => {
    note._deleted = true;
    note._ttl = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
  };
  const handleEdit = (note: Note) => {
    // TODO: open editor
    note._updated = new Date().getTime();
  };
  return (
    <div className={style.root}>
      <PlateEditor />
      <h1>Notes</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="note-input">write your note</label>
        <textarea
          value={noteText}
          id="note-input"
          onChange={handleChange}
        ></textarea>
        <button type="submit"> Create Note</button>
      </form>

      <section>
        {Object.keys(notes).map((_id) => {
          const note = notes[_id];
          return (
            note.text &&
            !note._deleted && (
              <div className={style.note} key={note._id}>
                <div className={style.noteButtonRow}>
                  <button
                    onClick={() => handleDelete(note)}
                    className={style.iconButton}
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <p>{note.text}</p>
              </div>
            )
          );
        })}
      </section>
      <section className={style.editorSection}>
        <Editor onChange={handleChange} content={noteText} />
      </section>
    </div>
  );
};
export default NotesApp;
