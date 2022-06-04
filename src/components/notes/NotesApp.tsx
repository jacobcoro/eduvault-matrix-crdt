import { Edit, Trash } from '@styled-icons/fa-solid';
import { useSyncedStore } from '@syncedstore/react';
import Editor, { OnEditorChange } from 'components/Editor';
import { CollectionKey, Database, Documents, Note } from 'model';
import { StoreContext } from 'model/storeContext';

import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ulid } from 'ulid';
import style from './NotesApp.module.scss';
const initialMarkdown = `# Write a note`;

type INotesContext = {
  notes: Documents<Note> | null;
  handleSelectNote: (noteId: string) => void;
  handleDelete: (note: Note) => void;
  onChange: OnEditorChange;
  createNote: (noteText: string) => void;
  noteText: string;
};
const initialContext: INotesContext = {
  notes: null,
  handleSelectNote: () => {},
  handleDelete: () => {},
  onChange: () => {},
  createNote: () => {},
  noteText: initialMarkdown,
};
export const NotesContext = createContext(initialContext);

// problem: we need the onChange to be shared between the editor and the notes list, but the we dont want the editor to be re-rendered every time the notes object changes

export const NotesProvider: FC<{ children: any; db: Database }> = ({
  children,
  db,
}) => {
  console.log('notes-provider render');
  const notesStore = db.collections.notes[0].store.documents;

  const notes = useSyncedStore(notesStore);
  const handleDelete = (note: Note) => {
    note._deleted = true;
    note._ttl = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
  };

  const [noteText, setNoteText] = useState(initialMarkdown);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  const handleSelectNote = (_id: string) => {
    setSelectedNoteId(_id);
    const text = notes[_id].text;
    setNoteText(text);
  };

  const onChange = useCallback(
    (markdown: string) => {
      console.log({
        currentNote: notes[selectedNoteId],
        text: notes[selectedNoteId].text,
      });
      if (notes && notes[selectedNoteId]) notes[selectedNoteId].text = markdown;
    },
    [notes, selectedNoteId]
  );

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

  return (
    <NotesContext.Provider
      value={{
        notes: notes,
        handleSelectNote,
        handleDelete,
        onChange,
        createNote,
        noteText,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

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
  let notesStore = null;

  if (db && store && JSON.stringify(store) !== '{}' && ready)
    return (
      <NotesProvider db={db}>
        <NotesAppInternal />
      </NotesProvider>
    );
  return <div>loading collections...</div>;
};

// build a notes context. use it only in the notes list. The setNote function will be shared between the editor and the list. only the list updates the context. That way the editor won't keep rerendering.

const NotesList = () => {
  const { createNote, notes, handleSelectNote, handleDelete } =
    useContext(NotesContext);
  if (!notes) return <div></div>;
  return (
    <>
      <button
        onClick={() => createNote('new note')}
        className={style.iconButton}
      >
        <Edit size={28} />
      </button>
      {Object.keys(notes).map((_id) => {
        const note = notes[_id];
        return (
          note.text &&
          !note._deleted && (
            <div
              className={style.note}
              key={note._id}
              onClick={() => handleSelectNote(_id)}
            >
              <div className={style.noteButtonRow}>
                <button
                  onClick={() => handleDelete(note)}
                  className={style.iconButton}
                >
                  <Trash size={16} />
                </button>
              </div>
              <Editor readOnly content={note.text} />{' '}
            </div>
          )
        );
      })}
    </>
  );
};

const NotesAppInternal = () => {
  // not dynamic, just sets the initial text for the currently editing note

  console.log('notes-app-internal render');
  return (
    <div className={style.root}>
      <section className={style.notesListSection}>
        <NotesList />
      </section>
      <section className={style.editorSection}>
        <Editor />
      </section>
    </div>
  );
};
export default NotesApp;
