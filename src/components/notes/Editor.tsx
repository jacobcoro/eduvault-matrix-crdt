import React, { useCallback, useMemo } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import {
  Editor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
  Descendant,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  BulletedListItemElement,
  CustomEditor,
  CustomElement,
  ElementType,
} from './slate-types';

type SHORTCUT_KEY =
  | '*'
  | '-'
  | '+'
  | '>'
  | '#'
  | '##'
  | '###'
  | '####'
  | '#####'
  | '######';

const SHORTCUTS: { [key in SHORTCUT_KEY]: ElementType } = {
  '-': ElementType.ul,
  '*': ElementType.ul,
  '+': ElementType.ul,
  '>': ElementType.blockQuote,
  '#': ElementType.h1,
  '##': ElementType.h2,
  '###': ElementType.h3,
  '####': ElementType.h4,
  '#####': ElementType.h5,
  '######': ElementType.h6,
};

const MarkdownEditor = () => {
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const editor = useMemo(
    () => withShortcuts(withReact(withHistory(createEditor()))),
    []
  );
  return (
    <Slate editor={editor} value={initialValue}>
      <Editable
        renderElement={renderElement}
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

const withShortcuts = (editor: CustomEditor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) as SHORTCUT_KEY;
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const newProperties: Partial<SlateElement> = {
          type,
        };
        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: (n) => Editor.isBlock(editor, n),
        });

        if (type === 'bulleted-list-item') {
          const list: BulletedListItemElement = {
            type: ElementType.ul,
            children: [],
          };
          Transforms.wrapNodes(editor, list, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === 'bulleted-list-item',
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: ElementType.p,
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === 'bulleted-list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === ElementType.ul,
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

const Element = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: CustomElement;
}) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list-item':
      return <ul {...attributes}>{children}</ul>;
    case 'bulleted-list-item':
      return <li {...attributes}>{children}</li>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    default:
      return <p {...attributes}>{children}</p>;

    // todo: link, checkListItem, image
  }
};

const initialValue: Descendant[] = [
  {
    type: ElementType.p,
    children: [
      {
        text: 'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: ElementType.blockQuote,
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: ElementType.p,
    children: [
      {
        text: 'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: ElementType.h2,
    children: [{ text: 'Try it out!' }],
  },
  {
    type: ElementType.p,
    children: [
      {
        text: 'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];

export default MarkdownEditor;
