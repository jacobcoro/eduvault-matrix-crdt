import { Room } from '../types';

import { syncedStore, getYjsValue } from '@syncedstore/core';
import * as Y from 'yjs';
import { newMatrixProvider } from '../utils';
import { Database, initialRegistryStore } from '..';

/** make sure to query the current collection to make sure the passed room's id and alias are correct.  */
export const connectRoom = (_db: Database) =>
  function <T>(
    room: Room<T>,
    /** Only pass this when creating the registry itself */
    registryConnect?: true
  ) {
    return new Promise<boolean>((resolve, reject) => {
      try {
        _db.collections[room.collectionKey][room._id].connectStatus = 'loading';

        const roomAlias = room.roomAlias;
        if (!roomAlias) {
          throw new Error("can't connect without roomAlias");
        }
        if (!_db.matrixClient) {
          throw new Error("can't connect without matrixClient");
        }
        const store = syncedStore({ documents: {} });
        const doc = getYjsValue(store) as Y.Doc;

        // todo: do we also need to register the localStorage provider here too?

        room.matrixProvider = newMatrixProvider({
          doc,
          matrixClient: _db.matrixClient,
          roomAlias,
        });

        // connect or fail callbacks:
        room.matrixProvider?.onDocumentAvailable(async (e) => {
          _db.collections[room.collectionKey][room._id].doc = doc;
          _db.collections[room.collectionKey][room._id].store = store;

          if (!registryConnect) {
            // register room in registry
            _db.collections.registry[0].store.documents[0][room.collectionKey][
              room._id
            ] = {
              roomAlias,
              roomId: room._id,
            };
          }

          if (registryConnect) {
            // set initial registry
            _db.collections.registry[0].store.documents[0] =
              initialRegistryStore.documents[0];
          }
          if (_db.onRoomConnectStatusUpdate)
            _db.onRoomConnectStatusUpdate('ok', room.collectionKey, room._id);
          resolve(true);
        });

        room.matrixProvider?.onDocumentUnavailable((e) => {
          if (_db.onRoomConnectStatusUpdate)
            _db.onRoomConnectStatusUpdate(
              'failed',
              room.collectionKey,
              room._id
            );
          _db.collections[room.collectionKey][room._id].connectStatus =
            'failed';
          reject(new Error('onDocumentUnavailable'));
        });
      } catch (error) {
        console.error(error);
        if (_db.onRoomConnectStatusUpdate)
          _db.onRoomConnectStatusUpdate('failed', room.collectionKey, room._id);
        _db.collections[room.collectionKey][room._id].connectStatus = 'failed';
        reject(error);
      }
    });
  };
