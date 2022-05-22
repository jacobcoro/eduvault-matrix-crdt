import { DocumentBase } from '../types';

export type FlashCard = DocumentBase<{
  frontText: string;
  backText: string;
  noteLink?: string;
}>;
