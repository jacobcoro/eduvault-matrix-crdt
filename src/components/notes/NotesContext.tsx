import { useSyncedStore } from '@syncedstore/react';
import { OnEditorChange } from 'components/Editor';
import { Database, Documents, Note } from 'model';

import { createContext, FC, useCallback, useState } from 'react';

export const initialMarkdown = `# Write a note`;
export const formatNewNote = (text: string, id: string) => {
  const newNote: Note = {
    _ref: id, // todo: use create ref
    text,
    _id: id,
    _created: new Date().getTime(),
    _updated: new Date().getTime(),
  };
  return newNote;
};

type INotesContext = {
  notes: Documents<Note> | null;
  handleSelectNote: (noteId: string) => void;
  handleDelete: (note: Note) => void;
  onChange: OnEditorChange;
  createNote: (noteText: string, noteId: string) => void;
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

export const NotesProvider: FC<{ children: any; db: Database }> = ({
  children,
  db,
}) => {
  const notesStore = db.collections.notes[0].store.documents;

  const notes = useSyncedStore(notesStore);

  const handleDelete = (note: Note) => {
    note._deleted = true;
    note._ttl = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
  };

  let mostRecentNote = '0';
  const findMostRecentNote = () => {
    let lastEdited = 0;
    Object.keys(notes).forEach((noteId) => {
      if (notes[noteId]._updated > lastEdited) {
        lastEdited = notes[noteId]._updated;
        mostRecentNote = noteId;
      }
    });
    return mostRecentNote;
  };
  const nonDeletedNotes = Object.values(notes).filter(
    (note) => !note._deleted && note.text
  );

  if (nonDeletedNotes.length > 0) {
    mostRecentNote = findMostRecentNote();
  } else {
    notes[mostRecentNote] = formatNewNote(initialMarkdown, mostRecentNote);
  }

  const [selectedNoteId, setSelectedNoteId] = useState<string>(mostRecentNote);
  const [noteText, setNoteText] = useState(notes[mostRecentNote].text);

  const createNote = (text: string, id: string) => {
    notes[id] = formatNewNote(text, id);
  };
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
      if (notes && notes[selectedNoteId]) {
        notes[selectedNoteId].text = markdown;
        notes[selectedNoteId]._updated = new Date().getTime();
      }
    },
    [notes, selectedNoteId]
  );

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
