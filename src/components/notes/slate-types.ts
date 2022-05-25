import {
  Text,
  createEditor,
  Node,
  Element,
  Editor,
  Descendant,
  BaseEditor,
  BaseElement,
} from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export enum ElementType {
  blockQuote = 'block-quote',
  ol = 'numbered-list-item',
  ul = 'bulleted-list-item',
  checkListItem = 'check-list-item',
  h1 = 'heading-one',
  h2 = 'heading-two',
  h3 = 'heading-three',
  h4 = 'heading-four',
  h5 = 'heading-five',
  h6 = 'heading-six',
  p = 'paragraph',
  link = 'link',
}

interface ElementBase {
  type: ElementType;
  children: Descendant[];
}

interface TextElement extends ElementBase {
  align?: string;
}

export interface BlockQuoteElement extends TextElement {
  type: ElementType.blockQuote;
}

export interface BulletedListItemElement extends TextElement {
  type: ElementType.ul;
}
export interface NumberedListItemElement extends TextElement {
  type: ElementType.ol;
}
export interface CheckListItemElement extends ElementBase {
  checked: boolean;
  type: ElementType.checkListItem;
}

export interface H1Element extends TextElement {
  type: ElementType.h1;
}
export interface H2Element extends TextElement {
  type: ElementType.h2;
}
export interface H3Element extends TextElement {
  type: ElementType.h3;
}
export interface H4Element extends TextElement {
  type: ElementType.h4;
}
export interface H5Element extends TextElement {
  type: ElementType.h5;
}
export interface H6Element extends TextElement {
  type: ElementType.h6;
}
export interface ParagraphElement extends TextElement {
  type: ElementType.p;
}
export interface LinkElement extends BaseElement {
  type: ElementType.link;
  url: string;
}
// export type EditableVoidElement = {
//   type: ElementType['editable-void'];
//   children: EmptyText[];
// };
// export type ImageElement = {
//   type: ElementType['image'];
//   url: string;
//   children: EmptyText[];
// };

// export type ButtonElement = {
//   type: ElementType['button'];
//   children: Descendant[];
// };

// export type ListElement = {
//   type: ElementType.list
//   children: Descendant[];
// };

// export type MentionElement = {
//   type: ElementType['mention'];
//   character: string;
//   children: CustomText[];
// };

// export type TableElement = {
//   type: ElementType['table'];
//   children: TableRowElement[];
// };

// export type TableCellElement = {
//   type: ElementType['table-cell'];
//   children: CustomText[];
// };

// export type TableRowElement = {
//   type: ElementType['table-row'];
//   children: TableCellElement[];
// };

// export type TitleElement = {
//   type: ElementType['title'];
//   children: Descendant[];
// };

// export type VideoElement = {
//   type: ElementType['video'];
//   url: string;
//   children: EmptyText[];
// };

export type CustomElement =
  | BlockQuoteElement
  | BulletedListItemElement
  | NumberedListItemElement
  | CheckListItemElement
  | H1Element
  | H2Element
  | H3Element
  | H4Element
  | H5Element
  | H6Element
  | ParagraphElement
  | LinkElement;
// | EditableVoidElement
// | ImageElement
// | ButtonElement
// | MentionElement
// | TableElement
// | TableRowElement
// | TableCellElement
// | TitleElement
// | VideoElement;

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  text: string;
};

export type EmptyText = {
  text: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
  }
}
