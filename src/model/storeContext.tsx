import { emptyStore, Store } from 'model';
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';
import { syncedStore } from '@syncedstore/core';
import { TEST_ROOM_ID } from 'config';
import { MatrixProvider } from '@jacobcoro/matrix-crdt';
import { MatrixClient } from 'matrix-js-sdk';
import * as Y from 'yjs';
import { getYjsValue } from '@syncedstore/core';
import { createMatrixClient, LoginData } from './utils';

type LoginStatus = 'initial' | 'loading' | 'failed' | 'ok' | 'disconnected';

export interface StoreContext {
  store: Store;
  login: (loginData: LoginData) => Promise<void>;
  matrixClient: MatrixClient | undefined;
  loginStatus: LoginStatus;
}

const initialStore: StoreContext = {
  store: emptyStore,
  login: async () => undefined,
  matrixClient: undefined,
  loginStatus: 'initial',
};

export const StoreContext = createContext<StoreContext>(initialStore);
export const globalStore = syncedStore(emptyStore);

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
  const store = globalStore as Store;
  const doc = getYjsValue(store) as Y.Doc;

  const [matrixProvider, setMatrixProvider] = useState<MatrixProvider>();
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('initial');
  const [roomAlias, setRoomAlias] = useState<string>(TEST_ROOM_ID);
  const [matrixClient, setMatrixClient] = useState<any>();

  const connect = useCallback(
    (matrixClient: MatrixClient, roomAlias: string) => {
      if (!matrixClient || !roomAlias) {
        throw new Error("can't connect without matrixClient or roomAlias");
      }
      setLoginStatus('loading');

      const matrixProvider = newMatrixProvider({
        doc,
        matrixClient,
        roomAlias,
      });
      setMatrixProvider(matrixProvider);

      // (optional): capture events from MatrixProvider to reflect the status in the UI
      matrixProvider.onDocumentAvailable((e) => {
        setLoginStatus('ok');
      });

      matrixProvider.onCanWriteChanged((e) => {
        if (!matrixProvider.canWrite) {
          setLoginStatus('failed');
        } else {
          setLoginStatus('ok');
        }
      });

      matrixProvider.onDocumentUnavailable((e) => {
        setLoginStatus('failed');
      });
    },
    [doc]
  );
  const login = async (loginData: LoginData) => {
    if (matrixProvider) {
      matrixProvider.dispose();
      setLoginStatus('disconnected');
      setMatrixProvider(undefined);
    }
    const matrixClient = await createMatrixClient(loginData!);
    setMatrixClient(matrixClient);
    setRoomAlias(roomAlias);

    connect(matrixClient, roomAlias);
  };
  return (
    <StoreContext.Provider value={{ store, login, loginStatus, matrixClient }}>
      {children}
    </StoreContext.Provider>
  );
};
