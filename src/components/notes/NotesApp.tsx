import Editor from 'components/Editor';
import { CollectionKey } from 'model';
import { StoreContext } from 'model/storeContext';

import { useCallback, useContext, useEffect, useState } from 'react';
import style from './NotesApp.module.scss';
import { NotesProvider } from './NotesContext';
import NotesList from './NotesList';

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

  if (db && store && JSON.stringify(store) !== '{}' && ready)
    return (
      <NotesProvider db={db}>
        <NotesAppInternal />
      </NotesProvider>
    );
  return <div>loading collections...</div>;
};

const NotesAppInternal = () => {
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
