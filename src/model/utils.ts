import sdk, { ICreateClientOpts, MatrixClient } from 'matrix-js-sdk';
import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import * as Y from 'yjs';

export interface LoginData extends ICreateClientOpts {
  password?: string;
  roomAlias?: string;
}

export type MatrixLoginRes = {
  access_token: string;
  device_id: string;
  home_server: string;
  user_id: string;
  well_known: { 'm.homeserver': { base_url: string } };
};

export enum Visibility {
  Public = 'public',
  Private = 'private',
}
/** @example ('@username:matrix.org')=> 'eduvault_root_username' */
export const constructRootRoomAliasTruncated = (userId: string) => {
  return `${constructRootRoomAlias(userId).split('#')[1].split(':')[0]}`;
};

/** @example ('@username:matrix.org')=> '#eduvault_root_username:matrix.org' */
export const constructRootRoomAlias = (userId: string) => {
  return `#eduvault_root_${userId.split('@')[1]}`;
};

export const getOrCreateRootRoom = async (matrixClient: MatrixClient) => {
  const userId = matrixClient.getUserId();
  const baseUrl = matrixClient.baseUrl;

  const rootRoomAlias = constructRootRoomAlias(userId);

  let existingRoom: { room_id: string } | null = null;
  try {
    console.time('getRoomIdForAlias');
    existingRoom = await matrixClient.getRoomIdForAlias(rootRoomAlias);
  } catch (error) {
    console.log('room not found from alias');
  }
  console.timeEnd('getRoomIdForAlias');
  console.log({ existingRoom });
  if (existingRoom?.room_id) {
    return existingRoom.room_id;
  } else {
    let newRoom: { room_id: string } | null = null;
    try {
      console.log('creating room');
      newRoom = await matrixClient.createRoom({
        preset: 'trusted_private_chat' as any,
        room_alias_name: constructRootRoomAliasTruncated(userId),
        name: 'Eduvault Root Room',
        topic:
          'The root room to store the location of all your other Eduvault collections',
        visibility: Visibility.Private, // some bad typings from the sdk. this is expecting an enum. but the enum is not exported from the library.
        // this enables encryption
        initial_state: [
          {
            type: 'm.room.encryption',
            state_key: '',
            content: {
              algorithm: 'm.megolm.v1.aes-sha2',
            },
          },
        ],
      });
      if (!newRoom || !newRoom.room_id) throw new Error('no room id');
      return newRoom.room_id;
    } catch (error: any) {
      if (error.message.includes('M_ROOM_IN_USE'))
        console.log('room already exists');
      // still a problem that it wasn't caught before this
      throw new Error(error);
    }
  }
};

export async function createMatrixClient(data: LoginData) {
  const { password, accessToken, baseUrl, userId, roomAlias } = data;
  const signInOpts = {
    baseUrl,
    userId,
  };
  const matrixClient = accessToken
    ? sdk.createClient({
        ...signInOpts,
        accessToken,
      })
    : sdk.createClient(signInOpts);

  if (accessToken) {
    // await matrixClient.loginWithToken(accessToken);
  } else {
    const loginRes: MatrixLoginRes = await matrixClient.login(
      'm.login.password',
      {
        user: userId,
        password,
      }
    );
    const loginSaveData: LoginData = {
      baseUrl,
      roomAlias,
      userId,
      accessToken: loginRes.access_token,
      deviceId: loginRes.device_id,
    };
    localStorage.setItem('loginData', JSON.stringify(loginSaveData));
  }

  // overwrites because we don't call .start();
  (matrixClient as any).canSupportVoip = false;
  (matrixClient as any).clientOpts = {
    lazyLoadMembers: true,
  };
  return matrixClient;
}

export const newMatrixProvider = ({
  matrixClient,
  doc,
  roomAlias,
}: {
  matrixClient: MatrixClient;
  doc: Y.Doc;
  roomAlias: string;
}) => {
  // This is the main code that sets up the connection between
  // yjs and Matrix. It creates a new MatrixProvider and
  // registers it to the `doc`.
  const newMatrixProvider = new MatrixProvider(
    doc,
    matrixClient,
    { type: 'alias', alias: roomAlias },
    undefined,
    {
      translator: { updatesAsRegularMessages: true },
      reader: { snapshotInterval: 10 },
      writer: { flushInterval: 500 },
    }
  );
  newMatrixProvider.initialize();
  return newMatrixProvider;
};
