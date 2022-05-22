import { MatrixClient } from 'matrix-js-sdk';
import { collectionKeys, collections } from './collections';
import { connectRoom, login } from './methods';
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
    _id: '0',
    matrixProvider: null,
    roomAlias: '#eduvault_registry_<username>:matrix.org', // to be replaced on login with real username
    store: initialRegistryStore,
  },
};

const updateLoginStatus = (_db: Database) => (status: ConnectStatus) => {
  _db.loginStatus = status;
  if (status === 'ok') _db.loggedIn = true;
  else _db.loggedIn = false;
  if (_db.onLoginStatusUpdate) _db.onLoginStatusUpdate(status);
};

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
  login = login(this);
  constructor() {
    // todo: if registry is in localStorage, load up each room's store.
  }
}
