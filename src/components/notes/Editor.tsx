import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { useState } from 'react';

export const Editor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});
