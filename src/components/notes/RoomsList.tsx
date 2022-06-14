import { CaretDown, CaretRight, PlusSquare } from '@styled-icons/fa-solid';
import { Database, Note, Room } from 'model';
import { useState } from 'react';
import { NotesProvider } from './NotesContext';
import NotesList from './NotesList';
import styles from './RoomsList.module.scss';
const RoomsList = ({ db }: { db: Database }) => {
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
        {roomKeys.map((roomKey, index) => (
          <RoomsListItem key={roomKey} room={rooms[roomKey]} index={index} />
        ))}
      </>
    </div>
  );
};

const RoomsListItem = ({
  room,
  index,
}: {
  room: Room<Note>;
  index: number;
}) => {
  const [show, setShow] = useState(index === 0); //show first room by default
  const shortenedAlias =
    room.roomAlias.length > 30
      ? room.roomAlias.slice(0, 30) + '...'
      : room.roomAlias;
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
