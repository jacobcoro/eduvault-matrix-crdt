import {
  AutoformatPlugin,
  CodeBlockElement,
  createPlateUI,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_PARAGRAPH,
  ELEMENT_TD,
  ELEMENT_TODO_LI,
  ExitBreakPlugin,
  HeadingToolbar,
  ImageToolbarButton,
  IndentPlugin,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  LinkToolbarButton,
  MediaEmbedToolbarButton,
  NormalizeTypesPlugin,
  Plate,
  PlatePlugin,
  ResetNodePlugin,
  SelectOnBackspacePlugin,
  SoftBreakPlugin,
  TrailingBlockPlugin,
  withProps,
} from '@udecode/plate';
import { Image } from '@styled-icons/material/Image';

import { useCallback, useEffect, useState } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { autoformatRules } from './autoformat/autoformatRules';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  IndentToolbarButtons,
  ListToolbarButtons,
  TableToolbarButtons,
} from './EditorToolbars';
import PLUGINS from './plugins';
import { Link } from '@styled-icons/material/Link';
import { CONFIG } from './config';
import { getTPlateSelectors, MyEditor, MyValue } from './typescript';
import { OndemandVideo } from '@styled-icons/material/OndemandVideo';
import { serialize } from 'remark-slate';

const initialValue: MyValue = [
  {
    type: 'p',
    children: [
      {
        text: 'Write a note',
      },
    ],
  },
];
const onChange = (v: string) => {
  console.log(v);
};
const PlateEditor = () => {
  // try to remove some plugins!
  const [debugValue, setDebugValue] = useState('');
  const onChangeDebug = (newValue: any) => {
    setDebugValue(`value ${JSON.stringify(newValue)}`);
    console.log(debugValue);
  };
  const [value, setValue] = useState<MyValue>(initialValue);
  const editor = getTPlateSelectors('editor-1').editor();
  useEffect(() => {
    console.log(editor?.id);
  }, [editor]);
  console.info(editor);

  const handleChange = (nextValue: MyValue) => {
    setValue(nextValue);
    // serialize slate state to a markdown string
    onChange(value.map((v: any) => serialize(v)).join(''));
  };

  return (
    <Plate<MyValue, MyEditor>
      id="editor-1"
      editableProps={CONFIG.editableProps as any}
      initialValue={initialValue}
      plugins={PLUGINS as any}
      onChange={handleChange}
      value={value}
    >
      <HeadingToolbar>
        <BasicElementToolbarButtons />
        <ListToolbarButtons />
        <IndentToolbarButtons />
        <BasicMarkToolbarButtons />
        {/* <AlignToolbarButtons /> */}
        <LinkToolbarButton icon={<Link />} />{' '}
        <ImageToolbarButton icon={<Image aria-label="image-embed" />} />
        <MediaEmbedToolbarButton icon={<OndemandVideo />} />
        <TableToolbarButtons />
      </HeadingToolbar>
    </Plate>
  );
};

export default PlateEditor;
