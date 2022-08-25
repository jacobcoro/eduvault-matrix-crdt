import { CaretDown, CaretRight, PlusSquare } from '@styled-icons/fa-solid';
import { Database, Note, Room, truncateRoomAlias } from 'model';
import { StoreContext } from 'model/storeContext';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Dialog } from './Dialog';
import { NotesAppContext } from './NotesApp';
import { NotesProvider } from './NotesContext';
import NotesList from './NotesList';
import styles from './RoomsList.module.scss';

const RoomsList = ({ db }: { db: Database }) => {
  const rooms = db.collections.notes;
  const roomKeys = Object.keys(rooms);
  const { selectedRoom } = useContext(NotesAppContext);
  const [modalOpen, setOpen] = useState(false);
  const setModalOpen = (open: boolean) => {
    setOpen(open);
    setNewCollectionName('');
  };
  const [newCollectionName, setNewCollectionName] = useState('');
  const newRoom = (name: string) => {
    // TODO:
    // open a dialog to input the collection name
  };
  return (
    <div>
      <Dialog open={modalOpen} setOpen={setModalOpen}>
        <>
          <h1>New Collection</h1>
          <div className={styles.inputRow}>
            <label htmlFor="collection-name-input">name</label>
            <input
              placeholder="collection name"
              id="collection-name-input"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <button
              className={styles.newCollectionButton}
              disabled={!newCollectionName}
              onClick={() => {
                setModalOpen(false);
                newRoom(newCollectionName);
              }}
            >
              <PlusSquare size={24} />
            </button>
          </div>
        </>
      </Dialog>

      <div className={styles.headerRow}>
        <h3>Collections</h3>
        <button onClick={() => setModalOpen(true)}>
          <h5>new </h5>
          <PlusSquare size={18} />
        </button>
      </div>

      <>
        {roomKeys.map((roomKey) => (
          <RoomsListItem
            key={roomKey}
            room={rooms[roomKey]}
            isSelectedRoom={selectedRoom === roomKey}
          />
        ))}
      </>
    </div>
  );
};

const RoomsListItem = ({
  room,
  isSelectedRoom,
}: {
  room: Room<Note>;
  isSelectedRoom: boolean;
}) => {
  const { db, userId } = useContext(StoreContext);
  const { setSelectedRoom } = useContext(NotesAppContext);

  const [show, setShow] = useState(isSelectedRoom);
  const [roomName, setRoomName] = useState(room.name);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (room.name) {
      setRoomName(room.name);
    } else {
      let cleanedAlias = userId
        ? room.roomAlias.split(`_${userId}`)[0].slice(1)
        : room.roomAlias.slice(1);

      const shortenedAlias =
        cleanedAlias.length > 30
          ? cleanedAlias.slice(0, 30) + '...'
          : cleanedAlias;

      setRoomName(shortenedAlias);
    }
  }, [room.name, room.roomAlias, userId]);

  useEffect(() => {
    if (JSON.stringify(room.store.documents) !== '{}') {
      setReady(true);
      // console.log('room ready');
    } else {
      // console.log('room not connected');
      db?.connectRoom(room.roomAlias, room.collectionKey);
    }
  }, [room.store.documents, db, room]);

  if (!ready) return <div>...loading</div>;
  else
    return (
      <NotesProvider notesStore={room.store.documents}>
        <div
          className={styles.titleRow}
          onClick={() => setSelectedRoom(room.roomAlias)}
        >
          <span>
            <h3 style={{ display: 'inline' }}>{roomName}</h3>
            <button
              style={{ display: 'inline' }}
              onClick={() => setShow(!show)}
            >
              {show ? <CaretDown size={16} /> : <CaretRight size={16} />}
            </button>
          </span>
        </div>
        <hr />
        {show && <NotesList />}
      </NotesProvider>
    );
};

export default RoomsList;
