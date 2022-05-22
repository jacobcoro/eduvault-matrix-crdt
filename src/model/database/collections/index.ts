import { Collection, RegistryData } from '../types';
import { FlashCard } from './flashcards';
import { Note } from './notes';

export * from './notes';
export * from './flashcards';

export enum CollectionKey {
  notes = 'notes',
  flashcards = 'flashcards',
  registry = 'registry',
}

/** We don't include registry because we use this after login to get all non-registry collections. */
export const collectionKeys = [CollectionKey.notes, CollectionKey.flashcards];

export interface Collections {
  [CollectionKey.notes]: Collection<Note>;
  [CollectionKey.flashcards]: Collection<FlashCard>;
  [CollectionKey.registry]: Collection<RegistryData>;
}

export const collections = {
  notes: {},
  flashcards: {},
};
