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

export type LoginStatus =
  | 'initial'
  | 'loading'
  | 'failed'
  | 'ok'
  | 'disconnected';

type LoginFunction = (
  loginData: LoginData,
  setLoginStatus: (status: LoginStatus) => void
) => Promise<void>;
export interface StoreContext {
  store: Store;
  login: LoginFunction;
  matrixClient: MatrixClient | undefined;
}

const initialStore: StoreContext = {
  store: emptyStore,
  login: async () => undefined,
  matrixClient: undefined,
};

export const StoreContext = createContext<StoreContext>(initialStore);

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
        matrixProvider.current.onDocumentAvailable((e) => {
          setLoginStatus('ok');
        });

        matrixProvider.current.onCanWriteChanged((e) => {
          console.log(matrixProvider.current?.canWrite);
          if (matrixProvider.current && !matrixProvider.current.canWrite) {
            setLoginStatus('failed');
          } else {
            setLoginStatus('ok');
          }
        });

        matrixProvider.current.onDocumentUnavailable((e) => {
          setLoginStatus('failed');
        });
      } catch (error) {
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
          setLoginStatus('disconnected');
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
        setLoginStatus('failed');
      }
    },
    [connect]
  );

  useEffect(() => {
    // initialize localStorage indexedDb sync provider
    // put in useEffect to make sure it only runs client side
    new IndexeddbPersistence('my-document-id', doc);

    const previousLoginData = localStorage.getItem('loginData');
    if (previousLoginData) {
      const loginData = JSON.parse(previousLoginData);
      login(loginData, (status: string) => null);
    }
  }, [login, doc]);
  return (
    <StoreContext.Provider
      value={{ store, login, matrixClient: matrixClient.current }}
    >
      {children}
    </StoreContext.Provider>
  );
};
