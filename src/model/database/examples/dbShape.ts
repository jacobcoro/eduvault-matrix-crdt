import { CollectionKey, Collections } from '../types';
import { buildRef } from '../utils';

//** to conceptualize DB shape. Note that */
export const exampleDb: { collections: Collections } = {
  collections: {
    registry: {
      ['0']: {
        _id: '0',
        collectionKey: CollectionKey.registry,
        matrixProvider: null,
        roomAlias: '#eduvault_registry_<username>:matrix.org',
        connectStatus: 'ok',

        store: {
          documents: {
            ['0']: {
              _ref: 'registry.0.0',
              _id: '0',
              _created: 0,
              _updated: 0,
              notes: {
                ['0']: { roomAlias: 'notes-room-alias-1' },
              },
              flashcards: {
                ['0']: { roomAlias: 'flashcard-room-alias-1' },
                ['1']: { roomAlias: 'flashcard-room-alias-2' },
              },
              registry: {},
            },
          },
        },
      },
    },
    notes: {
      // Rooms
      ['0']: {
        _id: '0',
        collectionKey: CollectionKey.notes,
        matrixProvider: null,
        roomAlias: 'notes-room-alias-1',
        name: 'Typescript Study Notes',
        connectStatus: 'ok',
        store: {
          documents: {
            ['0']: {
              text: 'A fact about Typescript',
              _ref: 'notes.0.0',
              _id: '0',
              _created: 1653135317729,
              _updated: 1653135317729,
            },
            ['1']: {
              text: 'Second fact about Typescript',
              _ref: 'notes.0.1',
              _id: '0',
              _created: 1653135317729,
              _updated: 1653135317729,
            },
          },
        },
      },
    },
    flashcards: {
      ['0']: {
        _id: '0',
        collectionKey: CollectionKey.flashcards,
        matrixProvider: null,
        roomAlias: 'notes-room-alias-1',
        name: 'Typescript Study Flashcards',
        connectStatus: 'ok',

        store: {
          documents: {
            ['0']: {
              frontText: 'Question',
              backText: 'Answer',
              noteLink: 'notes.0.0', // or use buildRef('notes', '0','0')
              _ref: 'flashcards.0.0',
              _id: 'noteID',
              _created: 1653135317729,
              _updated: 1653135317729,
            },
          },
        },
      },
      ['1']: {
        _id: '1',
        collectionKey: CollectionKey.flashcards,
        matrixProvider: null,
        roomAlias: 'notes-room-alias-2',
        name: 'Chinese Study Flashcards',
        connectStatus: 'ok',

        store: {
          documents: {
            ['0']: {
              frontText: 'Question',
              backText: 'Answer',
              noteLink: buildRef(CollectionKey.notes, 0, 0),
              _ref: 'flashcards.1.0',
              _id: 'noteID',
              _created: 1653135317729,
              _updated: 1653135317729,
            },
          },
        },
      },
    },
  },
};
