import { emptyStore, Store } from 'model';
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { syncedStore } from '@syncedstore/core';
import { TEST_ROOM_ID } from 'config';
import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import { MatrixClient } from 'matrix-js-sdk';
import * as Y from 'yjs';
import { getYjsValue } from '@syncedstore/core';
import { createMatrixClient, LoginData } from './utils';
import { IndexeddbPersistence } from 'y-indexeddb';

export type LoginStatus = 'initial' | 'loading' | 'failed' | 'ok';

type LoginFunction = (
  loginData: LoginData,
  setLoginStatus: (status: LoginStatus) => void
) => Promise<void>;
export interface StoreContext {
  store: Store;
  login: LoginFunction;
  matrixClient: MatrixClient | undefined;
  loggedIn: boolean;
}

const initialStore: StoreContext = {
  store: emptyStore,
  login: async () => undefined,
  matrixClient: undefined,
  loggedIn: false,
};
enum Visibility {
  Public = 'public',
  Private = 'private',
}
export const StoreContext = createContext<StoreContext>(initialStore);

/** @example ('@username:matrix.org')=> 'eduvault_root_username' */
const constructRootRoomAliasTruncated = (userId: string) => {
  return `${constructRootRoomAlias(userId).split('#')[1].split(':')[0]}`;
};
/** @example ('@username:matrix.org')=> '#eduvault_root_username:matrix.org' */
const constructRootRoomAlias = (userId: string) => {
  return `#eduvault_root_${userId.split('@')[1]}`;
};

const getOrCreateRootRoom = async (
  matrixClient: MatrixClient,
  userId: string
) => {
  // const joinedRooms = await matrixClient.getJoinedRooms();
  // console.log({ joinedRooms });
  // const allRooms = await matrixClient.getRooms();
  // console.log({ allRooms }); // so much empty....
  const rootRoomAlias = constructRootRoomAlias(userId);

  let existingRoom: { room_id: string } | null = null;
  try {
    existingRoom = await matrixClient.getRoomIdForAlias(rootRoomAlias);
  } catch (error) {
    // console.log('room not found from alias');
  }
  if (existingRoom?.room_id) {
    return existingRoom.room_id;
  } else {
    let newRoom: { room_id: string } | null = null;
    try {
      newRoom = await matrixClient.createRoom({
        room_alias_name: constructRootRoomAliasTruncated(userId),
        name: 'Eduvault Root',
        topic: 'The root ',
        // visibility: Visibility.Private, // some bad typings from the sdk. this is expecting an enum. but the enum is not exported from the library.
      });
      if (!newRoom || newRoom.room_id) throw new Error('no room id');
    } catch (error: any) {
      if (error.message.includes('M_ROOM_IN_USE'))
        console.log('room already exists');
      // still a problem that it wasn't caught before this
      throw new Error(error);
    }
    return newRoom.room_id;
  }
};

const newMatrixProvider = ({
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

export const StoreProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const store = useRef(syncedStore(emptyStore)).current as Store;
  const doc = useRef(getYjsValue(store)).current as Y.Doc;
  const [loggedIn, setLoggedIn] = useState(false);
  let matrixProvider = useRef<MatrixProvider>();
  let matrixClient = useRef<MatrixClient>();

  const connect = useCallback(
    (
      matrixClient: MatrixClient,
      roomAlias: string,
      setLoginStatus: (status: LoginStatus) => void
    ) => {
      try {
        if (!matrixClient || !roomAlias) {
          throw new Error("can't connect without matrixClient or roomAlias");
        }

        matrixProvider.current = newMatrixProvider({
          doc,
          matrixClient,
          roomAlias,
        });

        // (optional): capture events from MatrixProvider to reflect the status in the UI
        matrixProvider.current.onDocumentAvailable(async (e) => {
          const rootRoomIdResponse = await getOrCreateRootRoom(
            matrixClient,
            matrixClient.getUserId()
          );
          console.log({ rootRoomIdResponse });
          console.log('onDocumentAvailable', e);
          setLoggedIn(true);
          setLoginStatus('ok');
        });

        matrixProvider.current.onCanWriteChanged((e) => {
          // this never seems to be called
          console.log('onCanWriteChanged', e);
          console.log(matrixProvider.current?.canWrite);
          if (matrixProvider.current && !matrixProvider.current.canWrite) {
            setLoggedIn(false);
            setLoginStatus('failed');
          } else {
            setLoggedIn(true);
            setLoginStatus('ok');
          }
        });

        matrixProvider.current.onDocumentUnavailable((e) => {
          setLoggedIn(false);
          setLoginStatus('failed');
        });
      } catch (error) {
        setLoggedIn(false);
        setLoginStatus('failed');
      }
    },
    [doc]
  );

  const login: LoginFunction = useCallback(
    async (loginData, setLoginStatus) => {
      try {
        if (matrixProvider) {
          matrixProvider.current?.dispose();
          matrixProvider.current = undefined;
        }
        setLoginStatus('loading');

        matrixClient.current = await createMatrixClient(loginData);
        connect(
          matrixClient.current,
          loginData.roomAlias ?? TEST_ROOM_ID,
          setLoginStatus
        );
      } catch (error) {
        console.error(error);
        setLoggedIn(false);
        setLoginStatus('failed');
      }
    },
    [connect]
  );

  useEffect(() => {
    // initialize localStorage indexedDb sync provider
    // put in useEffect to make sure it only runs client side
    new IndexeddbPersistence('my-document-id', doc);
  }, [login, doc]);
  return (
    <StoreContext.Provider
      value={{ store, login, matrixClient: matrixClient.current, loggedIn }}
    >
      {children}
    </StoreContext.Provider>
  );
};
