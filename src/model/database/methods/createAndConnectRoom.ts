import { CollectionKey, Room } from '../types';
import { MatrixClient } from 'matrix-js-sdk';
import {
  buildRoomAlias,
  createRoom,
  Database,
  newEmptyRoom,
  truncateRoomAlias,
} from '..';

/** pass in undecorated alias. if the final will be # `#roomName_username:matrix.org' just pass roomName */
export const createAndConnectRoom =
  (_db: Database) =>
  async (
    collectionKey: CollectionKey,
    roomName: string,
    name?: string,
    topic?: string
  ) => {
    try {
      if (!_db.matrixClient)
        throw new Error("can't create room without matrixClient");
      const newNoteRoomAlias = buildRoomAlias(
        roomName,
        _db.matrixClient.getUserId()
      );
      const newNoteRoomAliasTruncated = truncateRoomAlias(newNoteRoomAlias);
      try {
        const result = await createRoom(
          _db.matrixClient,
          newNoteRoomAliasTruncated,
          name,
          topic
        );
        console.log({ result });
      } catch (error: any) {
        if (JSON.stringify(error).includes('M_ROOM_IN_USE'))
          console.log('room already exists');
        else throw error;
      }
      const index = Object.keys(_db.collections[collectionKey]).length;
      _db.collections[collectionKey][index] = newEmptyRoom<any>(
        collectionKey,
        '0',
        newNoteRoomAlias
      );

      return await _db.connectRoom(_db.collections.notes[0]);
    } catch (error) {
      console.error(error);
      return false;
    }
  };
