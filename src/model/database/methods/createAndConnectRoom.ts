import { CollectionKey, Documents, RegistryData } from '../types';
import {
  buildRoomAlias,
  createRoom,
  Database,
  newEmptyRoom,
  truncateRoomAlias,
} from '..';

/** pass in undecorated alias. if the final will be # `#<alias>_<username>:matrix.org' just pass <alias> */
export const createAndConnectRoom =
  (_db: Database) =>
  async ({
    collectionKey,
    alias,
    name,
    topic,
    registryStore,
  }: {
    collectionKey: CollectionKey;
    /** undecorated alias */
    alias: string;
    name?: string;
    topic?: string;
    registryStore?: {
      documents: Documents<RegistryData>;
    };
  }) => {
    try {
      if (!_db.matrixClient)
        throw new Error("can't create room without matrixClient");
      const newRoomAlias = buildRoomAlias(alias, _db.matrixClient.getUserId());
      const newRoomAliasTruncated = truncateRoomAlias(newRoomAlias);
      try {
        const createRoomResult = await createRoom(
          _db.matrixClient,
          newRoomAliasTruncated,
          name,
          topic
        );
        console.log({ createRoomResult });
      } catch (error: any) {
        if (JSON.stringify(error).includes('M_ROOM_IN_USE')) {
          // console.log('room already exists');
          await _db.matrixClient.joinRoom(newRoomAlias);
        } else throw error;
      }

      await _db.connectRoom(newRoomAlias, collectionKey, registryStore);
      return alias;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
