import React, { useContext } from 'react';

import dynamic from 'next/dynamic';
import styles from './Editor.module.scss';
import { NotesContext } from 'components/notes/NotesContext';

const Editor = dynamic(() => import('./MilkdownEditor'), { ssr: false });

export type OnEditorChange = (markdown: string) => void;

const MarkDownEditor: React.FC<{ readOnly?: boolean; content?: string }> = (
  props
) => {
  const { onChange, noteText } = useContext(NotesContext);
  return (
    <div className={styles.root}>
      <Editor
        onChange={onChange}
        content={props.content ?? noteText}
        readOnly={props.readOnly}
      />
    </div>
  );
};
export default MarkDownEditor;
