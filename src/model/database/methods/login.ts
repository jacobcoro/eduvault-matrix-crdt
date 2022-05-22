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
      const registryRoomAlias = await getOrCreateRegistry(_db.matrixClient);
      _db.collections.registry[0].roomAlias = registryRoomAlias;
      try {
        await _db.connectRoom(_db.collections.registry[0], true);
        _db.updateLoginStatus('ok');
      } catch (error) {
        console.error(error);
        return _db.updateLoginStatus('failed');
      }

      if (callback) callback();
    } catch (error) {
      console.error(error);
      _db.updateLoginStatus('failed');
    }
  };
