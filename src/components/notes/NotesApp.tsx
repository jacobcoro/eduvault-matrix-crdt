import { useSyncedStore } from '@syncedstore/react';
import Editor from 'components/Editor';
import { buildRoomAlias, CollectionKey, Database, Note, Room } from 'model';
import { StoreContext } from 'model/storeContext';
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

  const room: Room<Note> | null = db.collections.notes[selectedRoom] ?? null;
  const store = room?.store ?? null;
  const registry = db.getRegistryStore();
  const [ready, setReady] = useState(!!store?.documents);

  const registryStore = useSyncedStore(registry);

  const connectOrCreateRoom = useCallback(async () => {
    const defaultNotesRoomAlias = buildRoomAlias(
      defaultNotesRoomAliasKey,
      userId
    );
    if (!selectedRoom) return setSelectedRoom(defaultNotesRoomAlias);

    const notesRegistry = db.getCollectionRegistry(CollectionKey.notes) ?? {};
    // lookup notes rooms in registry
    if (Object.keys(notesRegistry).length === 0) {
      console.log('no notes rooms found, creating default room');

      const defaultNotesRoom = await db.createAndConnectRoom({
        collectionKey: CollectionKey.notes,
        alias: defaultNotesRoomAliasKey,
        name: 'Default Notes Collection',
        registryStore,
      });
      if (defaultNotesRoom) setReady(true);
      // todo: handle error
    } else {
      const res = await db.connectRoom(
        selectedRoom,
        CollectionKey.notes,
        registryStore
      );
      if (res) setReady(true);
      // todo: handle error
    }
  }, [db, selectedRoom, userId, setSelectedRoom, registryStore]);

  useEffect(() => {
    if (!ready) connectOrCreateRoom();
  }, [connectOrCreateRoom, ready]);
  if (ready) return <NotesAppDashboard db={db} />;
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
  if (!db || !db.collections.registry[0]?.store)
    return <div>...loading database</div>;

  return (
    <NotesAppProvider>
      <NotesAppInternal db={db}></NotesAppInternal>
    </NotesAppProvider>
  );
};

export default NotesApp;
