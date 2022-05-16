import { emptyStore, Store } from 'model';
import {
  createContext,
  Dispatch,
  FC,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react';
import { syncedStore } from '@syncedstore/core';
import { TEST_ROOM_ID } from 'config';
import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import { MatrixClient } from 'matrix-js-sdk';
import { Doc } from 'yjs';
import { getYjsValue } from '@syncedstore/core';
import { createMatrixClient, LoginData } from './utils';

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
  store: any;
  login: LoginFunction;
  matrixClient: MatrixClient | undefined;
}

const initialStore: StoreContext = {
  store: {},
  login: async () => undefined,
  matrixClient: undefined,
};

export const StoreContext = createContext<StoreContext>(initialStore);

export const StoreProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const store = syncedStore(emptyStore);

  let matrixProvider = useRef<MatrixProvider>();
  let matrixClient = useRef<MatrixClient>();

  const connect = async (
    matrixClient: MatrixClient,
    roomAlias: string,
    setLoginStatus: (status: LoginStatus) => void
  ) => {
    try {
      if (!matrixClient || !roomAlias) {
        throw new Error("can't connect without matrixClient or roomAlias");
      }
      const newMatrixProvider = ({
        matrixClient,
        doc,
        roomAlias,
      }: {
        matrixClient: MatrixClient;
        doc: Doc;
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
            enableExperimentalWebrtcSync: true,
            translator: { updatesAsRegularMessages: true },
            reader: { snapshotInterval: 10 },
            writer: { flushInterval: 500 },
          }
        );
        newMatrixProvider.initialize();
        return newMatrixProvider;
      };
      matrixProvider.current = newMatrixProvider({
        doc: getYjsValue(store) as Doc,
        matrixClient,
        roomAlias,
      });

      // (optional): capture events from MatrixProvider to reflect the status in the UI
      matrixProvider.current.onDocumentAvailable((e) => {
        console.log('document available');
        console.log(
          'matrixProvider.current.canWrite',
          matrixProvider.current?.canWrite
        ); // prints true. but previous state hasn't been loaded.
        setLoginStatus('ok');
      });

      matrixProvider.current.onCanWriteChanged((e) => {
        console.log('can write changed'); // never gets called
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
  };

  const login: LoginFunction = async (loginData, setLoginStatus) => {
    try {
      if (matrixProvider) {
        matrixProvider.current?.dispose();
        setLoginStatus('disconnected');
        matrixProvider.current = undefined;
      }
      setLoginStatus('loading');

      matrixClient.current = await createMatrixClient(loginData);
      connect(matrixClient.current, TEST_ROOM_ID, setLoginStatus);
    } catch (error) {
      console.error(error);
      setLoginStatus('failed');
    }
  };
  return (
    <StoreContext.Provider
      value={{ store, login, matrixClient: matrixClient.current }}
    >
      {children}
    </StoreContext.Provider>
  );
};
