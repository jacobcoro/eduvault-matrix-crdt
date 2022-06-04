import { Edit, Trash } from '@styled-icons/fa-solid';
import Editor from 'components/Editor';

import { useContext } from 'react';
import style from './NotesApp.module.scss';
import { initialMarkdown, NotesContext } from './NotesContext';

const NotesList = () => {
  const { createNote, notes, handleSelectNote, handleDelete } =
    useContext(NotesContext);

  const notesLength = notes
    ? Object.values(notes).filter((note) => !note._deleted).length
    : 0;
  if (!notes) return <div></div>;
  return (
    <>
      <button
        onClick={() => createNote(initialMarkdown, notesLength.toString())}
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

export default NotesList;
