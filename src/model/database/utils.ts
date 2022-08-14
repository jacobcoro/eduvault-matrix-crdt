import sdk, { ICreateClientOpts, MatrixClient } from 'matrix-js-sdk';
import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import * as Y from 'yjs';
import { CollectionKey, Room } from './types';

export interface LoginData extends ICreateClientOpts {
  password?: string;
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
/** @example ('#roomName_username:matrix.org')=> 'roomName_username' */
export const truncateRoomAlias = (fullAlias: string) => {
  return `${fullAlias.split('#')[1].split(':')[0]}`;
};

/** @example ('@username:matrix.org')=> '#eduvault_registry_username:matrix.org' */
export const buildRegistryRoomAlias = (userId: string) => {
  return buildRoomAlias('eduvault_registry', userId);
};

/** @example ('@username:matrix.org')=> '#eduvault_space_username:matrix.org' */
export const buildSpaceRoomAlias = (userId: string) => {
  return buildRoomAlias('eduvault_space', userId);
};

/** @example ('roomName', '@username:matrix.org')=> '#roomName_username:matrix.org' */
export const buildRoomAlias = (alias: string, userId: string) => {
  // console.log({ alias, userId });
  const res = `#${alias}_${userId.split('@')[1]}`;
  // console.log({ res });
  return res;
};

export const checkForExistingRoomAlias = async (
  matrixClient: MatrixClient,
  alias: string
) => {
  let existingRoom: { room_id: string } | null = null;
  try {
    console.time('getRoomIdForAlias');
    existingRoom = await matrixClient.getRoomIdForAlias(alias);
  } catch (error) {
    console.log('room not found from alias');
  }
  console.timeEnd('getRoomIdForAlias');
  // console.log({ existingRoom });
  if (existingRoom?.room_id) {
    return true;
  } else return false;
};

export const getOrCreateSpace = async (
  matrixClient: MatrixClient,
  userId: string
) => {
  const spaceRoomAlias = buildSpaceRoomAlias(userId);
  const spaceRoomAliasTruncated = truncateRoomAlias(spaceRoomAlias);
  const spaceExists = await checkForExistingRoomAlias(
    matrixClient,
    spaceRoomAlias
  );

  if (spaceExists) {
    return spaceRoomAlias;
  } else {
    try {
      console.log('creating space room');
      await createRoom(
        matrixClient,
        spaceRoomAliasTruncated,
        'EduVault',
        'The parent space for all EduVault rooms'
      );

      return spaceRoomAlias;
    } catch (error: any) {
      if (error.message.includes('M_ROOM_IN_USE')) {
        console.log('room already exists');
        await matrixClient.joinRoom(spaceRoomAliasTruncated);
      }
      throw new Error(error);
    }
  }
};

export const getOrCreateRegistry = async (matrixClient: MatrixClient) => {
  const userId = matrixClient.getUserId();
  const space = await getOrCreateSpace(matrixClient, userId);
  console.log({ space });
  const registryRoomAlias = buildRegistryRoomAlias(userId);
  const registryRoomAliasTruncated = truncateRoomAlias(registryRoomAlias);
  const registryExists = await checkForExistingRoomAlias(
    matrixClient,
    registryRoomAlias
  );

  if (registryExists) {
    return registryRoomAlias;
  } else {
    try {
      console.log('creating registry room');
      await createRoom(
        matrixClient,
        registryRoomAliasTruncated,
        'Database Registry',
        'Where the database stores links to all your other rooms -- DO NOT DELETE'
      );

      return registryRoomAlias;
    } catch (error: any) {
      if (error.message.includes('M_ROOM_IN_USE')) {
        console.log('room already exists');
        await matrixClient.joinRoom(registryRoomAliasTruncated);
      }
      // still a problem that it wasn't caught before this

      throw new Error(error);
    }
  }
};

export async function createMatrixClient(data: LoginData) {
  console.log({ data });
  const { password, accessToken, baseUrl, userId } = data;
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
    console.log({ loginRes });
    const loginSaveData: LoginData = {
      baseUrl,
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

export const buildRef = (
  collection: CollectionKey,
  roomId: string | number,
  _id: string | number
) => `${collection}.${roomId}.${_id}`;

export const newEmptyRoom = <T>(
  collectionKey: CollectionKey,
  _id?: string,
  roomAlias?: string
) => {
  const room: Room<T> = {
    connectStatus: 'initial',
    collectionKey,
    _id: _id ?? '',
    matrixProvider: null,
    roomAlias: roomAlias ?? '',
    store: { documents: {} },
  };
  return room;
};

export const createRoom = async (
  matrixClient: MatrixClient,
  /** note this is the truncated version, including the username but without '#' and ':matrix.org */
  alias?: string,
  name?: string,
  topic?: string,
  encrypt: boolean = false
) => {
  let newRoom: { room_id: string } | null = null;
  const userId = matrixClient.getUserId();
  const spaceAlias = buildSpaceRoomAlias(userId);
  const spaceIdRes = await matrixClient.getRoomIdForAlias(spaceAlias);
  if (!spaceIdRes) throw new Error('space not found');
  const spaceId = spaceIdRes.room_id;
  const host = userId.split(':')[1];

  const initialState: sdk.ICreateRoomStateEvent[] = [
    {
      state_key: `!${spaceId}:${host}`,
      type: 'm.space.parent',
      content: {},
    },
  ];
  console.log({ initialState });
  if (encrypt)
    initialState.push({
      type: 'm.room.encryption',
      state_key: '',
      content: {
        algorithm: 'm.megolm.v1.aes-sha2',
      },
    });
  newRoom = await matrixClient.createRoom({
    room_alias_name: alias,
    name,
    topic,
    visibility: Visibility.Private, // some bad typings from the sdk. this is expecting an enum. but the enum is not exported from the library.
    // this enables encryption
    initial_state: initialState,
  });

  if (!newRoom || !newRoom.room_id) throw new Error('failed to create room');
  return newRoom;
};
