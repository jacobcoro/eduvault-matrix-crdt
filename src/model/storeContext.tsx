import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { syncedStore, getYjsValue } from '@syncedstore/core';
import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import { MatrixClient } from 'matrix-js-sdk';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

import { emptyStore, Store } from 'model';
import { TEST_ROOM_ID } from 'config';
import {
  constructRootRoomAlias,
  constructRootRoomAliasTruncated,
  createMatrixClient,
  getOrCreateRootRoom,
  LoginData,
  newMatrixProvider,
} from './utils';

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

export const StoreContext = createContext<StoreContext>(initialStore);

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
          console.log('onDocumentAvailable', e);
          await getOrCreateRootRoom(matrixClient);
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
