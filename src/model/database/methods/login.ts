import {
  buildRoomAlias,
  CollectionKey,
  createMatrixClient,
  createRoom,
  Database,
  getOrCreateRegistry,
  LoginData,
  newEmptyRoom,
  truncateRoomAlias,
} from '..';

/** Connects to Matrix client and loads registry
 *
 * login grabs the rooms from the registry. and rooms each room's metadata - room alias, room id into the db object. Should also save in localhost so that we can skip this step on next load.
 */
export const login =
  (_db: Database) => async (loginData: LoginData, callback?: () => void) => {
    try {
      _db.updateLoginStatus('loading');
      _db.matrixClient = await createMatrixClient(loginData);
      const registryRoomAlias = await getOrCreateRegistry(
        _db.matrixClient,
        _db
      );
      if (!registryRoomAlias)
        throw new Error('could not get registry room alias');

      try {
        const connectRegistryResponse = await _db.connectRoom(
          registryRoomAlias,
          CollectionKey.registry
        );
        // console.log({ connectRegistryResponse });
        _db.updateLoginStatus('ok');
      } catch (error) {
        console.log('connect room failed');
        console.error(error);
        return _db.updateLoginStatus('failed');
      }

      if (callback) callback();
    } catch (error) {
      console.log('login failed');
      console.error(error);
      _db.updateLoginStatus('failed');
    }
  };
