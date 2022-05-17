import { LoginStatus } from 'model/storeContext';
import { LoginData } from 'model/utils';
import { ChangeEventHandler } from 'react';
import style from './LoginForm.module.scss';
export interface Props {
  handleLogin: () => void;
  loginStatus: LoginStatus;
  loginData: LoginData;
  setLoginData: (loginData: LoginData) => void;
}

type FormField = keyof LoginData;

const LoginForm = ({
  handleLogin,
  loginStatus,
  loginData,
  setLoginData,
}: Props) => {
  const handleChange = (field: FormField, value: string) => {
    const loginDataChange = {
      ...loginData,
      [field]: value,
    };
    // todo: validation
    setLoginData(loginDataChange);
  };

  return (
    <div className={style.root}>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="server-input">Homeserver:</label>
        <input
          id="server-input"
          value={loginData.baseUrl}
          onChange={(e) => handleChange('baseUrl', e.target.value)}
        />

        <label htmlFor="room-input">Room alias</label>
        <input
          id="room-input"
          type="text"
          onChange={(e) => handleChange('roomAlias', e.target.value)}
          value={loginData.roomAlias}
        ></input>

        <label htmlFor="user-input">Matrix user id:</label>
        <input
          autoComplete="username"
          placeholder="e.g.: @yousefed:matrix.org"
          id="user-input"
          onChange={(e) => handleChange('userId', e.target.value)}
          value={loginData.userId}
        ></input>

        <label htmlFor="password-input">Password:</label>
        <input
          autoComplete="current-password"
          id="password-input"
          type="password"
          onChange={(e) => handleChange('password', e.target.value)}
          value={loginData.password}
        ></input>
        {loginStatus === 'failed' && (
          // TODO: show error
          <p className={style.error}>Login failed</p>
        )}

        <button disabled={loginStatus === 'loading'} onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
