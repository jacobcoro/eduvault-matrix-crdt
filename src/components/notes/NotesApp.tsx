import { useSyncedStore } from '@syncedstore/react';
import Editor from 'components/Editor';
import {
  buildRoomAlias,
  CollectionKey,
  Database,
  getUndecoratedRoomAlias,
  newEmptyRoom,
  truncateRoomAlias,
} from 'model';
import { StoreContext } from 'model/storeContext';
import { syncedStore } from '@syncedstore/core';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
  createContext,
} from 'react';
import style from './NotesApp.module.scss';
import { NotesProvider } from './NotesContext';

const defaultNotesRoomAliasKey = 'notes--default';
import RoomsList from './RoomsList';

type INotesAppContext = {
  selectedRoom: string;
  setSelectedRoom: Dispatch<SetStateAction<string>>;
  selectedNoteId: string;
  setSelectedNoteId: Dispatch<SetStateAction<string>>;
};
const initialContext: INotesAppContext = {
  selectedRoom: '',
  setSelectedRoom: () => {},
  selectedNoteId: '',
  setSelectedNoteId: () => {},
};

export const NotesAppContext = createContext(initialContext);

const NotesAppProvider: FC<{ children: any }> = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState('');

  return (
    <NotesAppContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        selectedNoteId,
        setSelectedNoteId,
      }}
    >
      {children}
    </NotesAppContext.Provider>
  );
};

const NotesAppInternal = ({ db }: { db: Database }) => {
  const { userId } = useContext(StoreContext);
  const { selectedRoom, setSelectedRoom } = useContext(NotesAppContext);

  let store = db.collections.notes[selectedRoom] ?? null;

  const room = db.collections.notes[selectedRoom];
  // const registryStore = db.getRegistryStore();

  // const registry = useSyncedStore(registryStore);
  const connectOrCreateRoom = useCallback(async () => {
    if (!db) return null;
    const notesRegistry = db.getCollectionRegistry(CollectionKey.notes) ?? {};
    console.log(Object.keys(notesRegistry));
    // lookup notes rooms in registry
    if (Object.keys(notesRegistry).length === 0) {
      // console.log('no notes rooms found, creating default room');
      const defaultNotesRoomAlias = buildRoomAlias(
        defaultNotesRoomAliasKey,
        userId
      );
      const defaultNotesRoom = await db.createAndConnectRoom({
        collectionKey: CollectionKey.notes,
        alias: defaultNotesRoomAliasKey,
        name: 'Default Notes Collection',
        // registry,
      });
      if (defaultNotesRoom) setSelectedRoom(defaultNotesRoomAlias);
    } else {
      if (!room || room.connectStatus !== 'ok')
        db.connectRoom(selectedRoom, CollectionKey.notes);
    }
  }, [db, selectedRoom, room, userId, setSelectedRoom]);

  useEffect(() => {
    connectOrCreateRoom();
  }, [connectOrCreateRoom]);

  if (store) return <NotesAppDashboard db={db} />;
  return <div>...loading collections</div>;
};

const NotesAppDashboard = ({ db }: { db: Database }) => {
  const { selectedRoom, selectedNoteId } = useContext(NotesAppContext);

  return (
    <div className={style.root}>
      <section className={style.notesListSection}>
        <RoomsList db={db} />
      </section>
      <section className={style.editorSection}>
        {/* editor just has notes provider of selected room */}
        <NotesProvider
          notesStore={db.collections.notes[selectedRoom].store.documents}
        >
          <Editor selectedNoteId={selectedNoteId} />
        </NotesProvider>
      </section>
    </div>
  );
};

const NotesApp = () => {
  const { db } = useContext(StoreContext);

  return (
    <NotesAppProvider>
      {db ? (
        <NotesAppInternal db={db}></NotesAppInternal>
      ) : (
        <div>...loading database</div>
      )}
    </NotesAppProvider>
  );
};

export default NotesApp;
