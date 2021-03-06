import style from './LoginForm.module.scss';
import { LoginData, ConnectStatus } from 'model';
export interface Props {
  handleLogin: () => void;
  loginStatus: ConnectStatus;
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

        <label htmlFor="user-input">Matrix user id: *</label>
        <input
          autoComplete="username"
          placeholder="e.g.: @jacob:matrix.org"
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
        <p>
          {`* Sign up at `}
          <a href="https://app.element.io/">element.io</a> with the username and
          password option
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
