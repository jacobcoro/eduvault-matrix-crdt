import sdk, { ICreateClientOpts } from 'matrix-js-sdk';

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
