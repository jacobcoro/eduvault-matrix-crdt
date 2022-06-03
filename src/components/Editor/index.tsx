import React from 'react';

import dynamic from 'next/dynamic';
import styles from './Editor.module.scss';

const Editor = dynamic(() => import('./MilkdownEditor'), { ssr: false });

export type OnEditorChange = (markdown: string) => void;

const MarkDownEditor: React.FC<{
  onChange: OnEditorChange;
  content: string;
}> = ({ onChange, content }) => {
  return (
    <div className={styles.root}>
      <Editor onChange={onChange} content={content} />
    </div>
  );
};
export default MarkDownEditor;
