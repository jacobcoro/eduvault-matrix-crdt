import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import * as Y from 'yjs';
import { CollectionKey } from './collections';
export type { Collections } from './collections';
export { CollectionKey };

export type DocumentBase<T> = T & {
  /**
   * @example <collectionKey>.<roomID>.<documentID> == `notes.5.1`
   */
  _ref: string;
  /** uuid, matches outer id */
  _id: string;
  /** epoch time created with new Date().getTime() */
  _created: number;
  /** epoch time updated with new Date().getTime() */
  _updated: number;
  _deleted?: boolean;
  /** time to live. an epoch time set when deleted flag is set. recommend one month from now
   * new Date().getTime() + 1000 * 60 * 60 * 24 * 30
   */
  _ttl?: number;
};

export interface Documents<T> {
  /** document ID can be string number starting at zero, based on order of creation */
  [documentId: string]: DocumentBase<T>;
}
export type ConnectStatus = 'initial' | 'loading' | 'failed' | 'ok';

/** corresponds to a 'room' in Matrix */
export interface Room<T> {
  connectStatus: ConnectStatus;
  collectionKey: CollectionKey;
  matrixProvider: MatrixProvider | null;
  roomAlias: string;
  name?: string;
  created?: Date;
  // roomId: string;
  doc?: Y.Doc;
  store: { documents: Documents<T> }; // the synced store.
}

export type Collection<T> = {
  // todo: methods to create and delete rooms
  [roomAlias: string]: Room<T>;
};

export interface RoomMetaData {
  roomAlias: string;
}

export type RegistryData = {
  [key in CollectionKey]: { [roomAlias: string]: RoomMetaData };
};

export type OnRoomConnectStatusUpdate = (
  status: ConnectStatus,
  collectionKey: CollectionKey,
  roomId: string
) => void;

export type OnLoginStatusUpdate = (status: ConnectStatus) => void;
