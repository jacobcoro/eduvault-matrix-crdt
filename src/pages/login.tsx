import { TEST_ROOM_ID } from 'config';
import { MatrixProvider } from 'matrix-crdt';
import { MatrixClient } from 'matrix-js-sdk';
import { useCallback, useState } from 'react';
type LoginStatus = 'loading' | 'failed' | 'ok' | 'disconnected';
import styles from './index.module.scss';

const Login = () => {
  console.log({ TEST_ROOM_ID });
  const [matrixProvider, setMatrixProvider] = useState<MatrixProvider>();
  const [status, setStatus] = useState<LoginStatus>();
  const [roomAlias, setRoomAlias] = useState<string>();
  const onLogin = useCallback(
    (matrixClient: MatrixClient, roomAlias = TEST_ROOM_ID) => {
      if (matrixProvider) {
        matrixProvider.dispose();
        setStatus('disconnected');
        setMatrixProvider(undefined);
      }

      const dbs = {
        user: {
          id: 'user-room-id',
          roomInfo: {
            // find the matrix room info and copy that
            public: false,
          },
        }, // basic user info}
        notes: {
          id: 'user-room-id',
          roomInfo: {
            public: false,
          },
        },
        flashcards: {
          id: 'user-room-id',
          roomInfo: {
            // find the matrix room info and copy that
            public: false,
          },
        },
      };

      // (optional) stored on state for easy disconnect + connect toggle
      // setMatrixClient(matrixClient);
      setRoomAlias(roomAlias);

      // actually connect
      // connect(matrixClient, roomAlias);
    },
    [matrixProvider]
  );

  return <div className={styles.root}>Login</div>;
};

export default Login;
