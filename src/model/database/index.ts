import { MatrixClient } from 'matrix-js-sdk';
import { collectionKeys, collections } from './collections';
import { connectRoom, createAndConnectRoom, login } from './methods';
import { updateLoginStatus } from './methods/updateLoginStatus';
import {
  Collection,
  CollectionKey,
  Collections,
  RegistryData,
  ConnectStatus,
  OnLoginStatusUpdate,
  OnRoomConnectStatusUpdate,
} from './types';

export * from './collections';
export * from './types';
export * from './utils';
export * from './methods';

export const initialRegistryStore = {
  documents: {
    '0': {
      _ref: 'registry.0.0',
      _id: '0',
      _created: 0,
      _updated: 0,
      notes: {},
      flashcards: {},
      registry: {},
    },
  },
};

export const initialRegistry: Collection<RegistryData> = {
  '0': {
    connectStatus: 'initial',
    collectionKey: CollectionKey.registry,
    matrixProvider: null,
    roomAlias: '#eduvault_registry_<username>:matrix.org', // to be replaced on login with real username
    store: initialRegistryStore,
  },
};

const getCollectionRegistry =
  (_db: Database) => (collectionKey: CollectionKey) =>
    _db.collections.registry['0'].store.documents['0'][collectionKey];

const getRegistryStore = (_db: Database) => () =>
  _db.collections.registry['0'].store;

export class Database {
  matrixClient: MatrixClient | null = null;
  // todo: callbacks on initialization status change.

  loggedIn = false;
  loginStatus: ConnectStatus = 'initial';

  updateLoginStatus = updateLoginStatus(this);
  onLoginStatusUpdate: null | OnLoginStatusUpdate = null;
  onRoomConnectStatusUpdate: null | OnRoomConnectStatusUpdate = null;

  /** homeserver */
  baseUrl: string = 'https://matrix.org';

  collectionKeys = collectionKeys;
  collections: Collections = {
    registry: initialRegistry,
    ...collections,
  };

  connectRoom = connectRoom(this);
  createAndConnectRoom = createAndConnectRoom(this);
  login = login(this);

  getCollectionRegistry = getCollectionRegistry(this);
  getRegistryStore = getRegistryStore(this);
  constructor() {
    // todo: if registry is in localStorage, load up each room's store.
  }
}
