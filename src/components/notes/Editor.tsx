import { MDEditorProps } from '@uiw/react-md-editor';
import { MarkdownPreviewProps } from '@uiw/react-markdown-preview';

import dynamic from 'next/dynamic';
import rehypeSanitize from 'rehype-sanitize';
const EditorDynamic = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

const ViewerDynamic = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});

export const Editor = (props: MDEditorProps) => {
  return (
    <EditorDynamic
      style={{ width: '100%', minHeight: '100%' }}
      {...props}
      previewOptions={{
        rehypePlugins: [[rehypeSanitize]],
      }}
    />
  );
};

export const Viewer = (props: MarkdownPreviewProps) => {
  return <ViewerDynamic {...props} />;
};
