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
      // connect client
      _db.matrixClient = await createMatrixClient(loginData);
      console.log('initial registry', _db.collections.registry[0]);
      // load registry
      const registryRoomAlias = await getOrCreateRegistry(_db.matrixClient);
      console.log({ registryRoomAlias });
      _db.collections.registry[0].roomAlias = registryRoomAlias;
      console.log('registry', _db.collections.registry[0]);
      try {
        await _db.connectRoom(
          _db.collections.registry[0],
          _db.matrixClient,
          true
        );
        _db.updateLoginStatus('ok');
      } catch (error) {
        console.error(error);
        return _db.updateLoginStatus('failed');
      }

      // todo: move this out of default login.
      // lookup notes rooms in registry
      const notesRegistry =
        _db.collections.registry[0].store.documents[0].notes;
      console.log({ notesRegistry });
      // connect each note room
      const notesKeysList = Object.keys(notesRegistry);
      console.log({ notesKeysList });
      notesKeysList.forEach((roomId) => {
        const noteRoom = _db.collections.notes[roomId];
        console.log({ noteRoom });
        if (noteRoom && _db.matrixClient) {
          _db.connectRoom(noteRoom, _db.matrixClient);
        }
      });

      if (notesKeysList.length === 0) {
        const newNoteRoomAlias = buildRoomAlias(
          'eduvault-notes-1',
          _db.matrixClient.getUserId()
        );
        const newNoteRoomAliasTruncated = truncateRoomAlias(newNoteRoomAlias);
        try {
          await createRoom(
            _db.matrixClient,
            newNoteRoomAliasTruncated,
            'notes 1'
          );
        } catch (error: any) {
          if (error.message.includes('M_ROOM_IN_USE'))
            console.log('room already exists');
        }
        _db.collections.notes[0] = newEmptyRoom(
          CollectionKey.notes,
          '0',
          newNoteRoomAlias
        );

        await _db.connectRoom(_db.collections.notes[0], _db.matrixClient);
      }
      if (callback) callback();
    } catch (error) {
      console.error(error);
      _db.updateLoginStatus('failed');
    }
  };
