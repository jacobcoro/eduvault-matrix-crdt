import { CaretDown, CaretRight, PlusSquare } from '@styled-icons/fa-solid';
import { Database, Note, Room } from 'model';
import { StoreContext } from 'model/storeContext';
import { useContext, useEffect, useState } from 'react';
import { NotesProvider } from './NotesContext';
import NotesList from './NotesList';
import styles from './RoomsList.module.scss';
const RoomsList = ({
  db,
  selectedRoom,
}: {
  db: Database;
  selectedRoom: string;
}) => {
  const rooms = db.collections.notes;
  const roomKeys = Object.keys(rooms);
  return (
    <div>
      <div className={styles.headerRow}>
        <h3>Collections</h3>
        <button>
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
  const { db } = useContext(StoreContext);
  const [userId, setUserId] = useState<string>();
  useEffect(() => {
    const getMe = async () => {
      const res = await db?.matrixClient?.whoami();
      if (res) setUserId(res.user_id.split('@')[1]);
    };
    getMe();
  }, [db, db?.matrixClient]);
  const [show, setShow] = useState(isSelectedRoom);
  let cleanedAlias = userId
    ? room.roomAlias.split(`_${userId}`)[0].slice(1)
    : room.roomAlias.slice(1);

  const shortenedAlias =
    cleanedAlias.length > 30 ? cleanedAlias.slice(0, 30) + '...' : cleanedAlias;

  const roomName = room.name ?? shortenedAlias;
  return (
    <NotesProvider notesStore={room.store.documents}>
      <div className={styles.titleRow}>
        <button onClick={() => setShow(!show)}>
          <h3>{roomName}</h3>
          {show ? <CaretDown size={16} /> : <CaretRight size={16} />}
        </button>
      </div>
      <hr />
      {show && <NotesList />}
    </NotesProvider>
  );
};

export default RoomsList;
