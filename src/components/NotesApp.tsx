import { Edit, Trash } from '@styled-icons/fa-solid';
import { useSyncedStore } from '@syncedstore/react';
import { Note } from 'model';
import { StoreContext } from 'model/storeContext';

import {
  ChangeEventHandler,
  FormEventHandler,
  useContext,
  useState,
} from 'react';
import { ulid } from 'ulid';
import style from './NotesApp.module.scss';
const NotesApp = () => {
  const { store } = useContext(StoreContext);
  const { notes } = useSyncedStore(store);

  const [noteText, setNoteText] = useState('');
  const createNote = (text: string) => {
    const id = ulid();
    const newNote: Note = {
      text,
      _id: id,
      _created: new Date().getTime(),
      _updated: new Date().getTime(),
    };
    notes.push(newNote);
  };
  console.log({ notes });
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.target.value) setNoteText(e.target.value);
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
        {notes.map(
          (note) =>
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
                  <button
                    onClick={() => handleEdit(note)}
                    className={style.iconButton}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <p>{note.text}</p>
              </div>
            )
        )}
      </section>
    </div>
  );
};
export default NotesApp;
