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
      console.log({ room });
      try {
        _db.collections[room.collectionKey][room._id].connectStatus = 'loading';

        const roomAlias = room.roomAlias;
        console.log({ roomAlias });
        if (!roomAlias) {
          throw new Error("can't connect without roomAlias");
        }
        if (!_db.matrixClient) {
          throw new Error("can't connect without matrixClient");
        }
        const store = syncedStore({ documents: {} });
        const doc = getYjsValue(store) as Y.Doc;

        // todo: do we also need to register the localStorage provider here too?

        const attemptConnect = () => {
          if (_db.matrixClient)
            room.matrixProvider = newMatrixProvider({
              doc,
              matrixClient: _db.matrixClient,
              roomAlias,
            });
        };
        attemptConnect();

        // connect or fail callbacks:
        room.matrixProvider?.onDocumentAvailable(async (e) => {
          console.log('onDocumentAvailable', e);
          _db.collections[room.collectionKey][room._id].doc = doc;
          _db.collections[room.collectionKey][room._id].store = store;

          if (!registryConnect) {
            let registryEntry =
              _db.collections.registry[0].store.documents[0][
                room.collectionKey
              ][room._id];
            console.log({ registryEntry });
            // if room isn't in registry:
            if (!registryEntry) {
              _db.collections.registry[0].store.documents[0][
                room.collectionKey
              ][room._id] = {
                roomAlias,
                roomId: room._id,
              };
              console.log(
                'updated registry',
                JSON.parse(
                  JSON.stringify(
                    _db.collections.registry[0].store.documents[0][
                      room.collectionKey
                    ]
                  )
                )
              );
            }
          }

          if (registryConnect) {
            console.log(
              'registryConnect',
              _db.collections.registry[0].store.documents
            );
            _db.collections.registry[0].store.documents[0] =
              initialRegistryStore.documents[0];

            // todo: make a room connect state
            // this only has to do with login because we need to make sure we've connected to the registry on login.
          }
          if (_db.onRoomConnectStatusUpdate)
            _db.onRoomConnectStatusUpdate('ok', room.collectionKey, room._id);
          resolve(true);
        });

        room.matrixProvider?.onDocumentUnavailable((e) => {
          console.log('onDocumentUnavailable', e);
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
