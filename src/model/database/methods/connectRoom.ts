import { CollectionKey, Room } from '../types';

import { syncedStore, getYjsValue } from '@syncedstore/core';
import * as Y from 'yjs';
import { newEmptyRoom, newMatrixProvider } from '../utils';
import { Database, initialRegistryStore } from '..';

/** make sure to query the current collection to make sure the passed room's id and alias are correct.  */
export const connectRoom = (_db: Database) =>
  function <T>(roomAlias: string, collectionKey: CollectionKey) {
    return new Promise<boolean>((resolve, reject) => {
      try {
        if (!_db.collections[collectionKey][roomAlias]) {
          //@ts-ignore
          _db.collections[collectionKey][roomAlias] = newEmptyRoom<T>(
            collectionKey,
            roomAlias
          );
        }
        const room = _db.collections[collectionKey][roomAlias];
        if (!room) {
          throw new Error('room not found');
        }

        room.connectStatus = 'loading';
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
        room.matrixProvider.initialize().then((result) => {
          // console.log('initialize result', result);
        });
        room.matrixProvider?.onReceivedEvents((events) => {
          // console.log('onReceivedEvents', events);
        });
        room.matrixProvider?.onCanWriteChanged((canWrite) => {
          // console.log('canWrite', canWrite);
          // resolve(true);
        });
        // connect or fail callbacks:
        room.matrixProvider?.onDocumentAvailable((e) => {
          // console.log('room.matrixProvider.onDocumentAvailable', { e });
          room.doc = doc;
          room.store = store;
          const registryConnect = collectionKey === CollectionKey.registry;

          if (!registryConnect) {
            //TODO: figure out how to get registry persisting.

            // register room in registry
            // console.log('registering room in registry', roomAlias);
            const existingStore = {
              ..._db.collections.registry[0].store.documents[0],
            };
            const registryStore = syncedStore({ documents: {} });
            _db.collections.registry[0].store = registryStore;
            //@ts-ignore
            registryStore.documents[0] = existingStore;

            // TODO: this is not persisting.
            //@ts-ignore
            registryStore.documents[0][room.collectionKey][roomAlias] = {
              roomAlias,
            };

            // TODO: set these in registry.
            const setRoomNameAndId = async () => {
              const roomId = await _db.matrixClient?.getRoomIdForAlias(
                room.roomAlias
              );
              console.log({ roomId });
              if (roomId?.room_id) {
                const roomRes = await _db.matrixClient?.getRoomSummary(
                  roomId?.room_id
                );
                console.log({ roomRes });

                if (roomRes) {
                  const roomName = roomRes.name;
                  if (roomName) {
                    room.name = roomName;
                  }
                } else {
                  const room2Res = await _db.matrixClient?.getRooms();
                  console.log({ room2Res });
                }
              }
            };
            setRoomNameAndId();
          }

          if (registryConnect) {
            // set initial registry
            _db.collections.registry[0].store.documents[0] =
              initialRegistryStore.documents[0];
          }
          if (_db.onRoomConnectStatusUpdate)
            _db.onRoomConnectStatusUpdate('ok', room.collectionKey, roomAlias);
          room.connectStatus = 'ok';

          resolve(true);
        });

        room.matrixProvider?.onDocumentUnavailable((e) => {
          if (_db.onRoomConnectStatusUpdate)
            _db.onRoomConnectStatusUpdate(
              'failed',
              room.collectionKey,
              roomAlias
            );
          room.connectStatus = 'failed';
          reject(new Error('onDocumentUnavailable'));
        });
      } catch (error) {
        console.log('connectRoom error', error);
        console.error(error);
        const room = _db.collections[collectionKey][roomAlias];
        if (room && _db.onRoomConnectStatusUpdate)
          _db.onRoomConnectStatusUpdate(
            'failed',
            room.collectionKey,
            room.roomAlias
          );
        if (room)
          _db.collections[room.collectionKey][room.roomAlias].connectStatus =
            'failed';
        reject(error);
      }
    });
  };
