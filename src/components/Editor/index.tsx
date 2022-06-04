import React from 'react';

import dynamic from 'next/dynamic';
import styles from './Editor.module.scss';
import { Props } from './MilkdownEditor';
const Editor = dynamic(() => import('./MilkdownEditor'), { ssr: false });

export type OnEditorChange = (markdown: string) => void;

const MarkDownEditor: React.FC<Props> = (props) => {
  return (
    <div className={styles.root}>
      <Editor {...props} />
    </div>
  );
};
export default MarkDownEditor;
