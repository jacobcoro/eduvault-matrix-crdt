import React from 'react';

import dynamic from 'next/dynamic';
const initialMarkdown = `# Write a note`;

const Editor = dynamic(() => import('./MilkdownEditor'), { ssr: false });

const MarkDownEditor: React.FC = () => {
  return <Editor content={initialMarkdown} />;
};
export default MarkDownEditor;
