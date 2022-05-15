import { Notes } from './notes';

export type Store = {
  notes: Notes;
};

export const emptyStore: Store = { notes: [] };
