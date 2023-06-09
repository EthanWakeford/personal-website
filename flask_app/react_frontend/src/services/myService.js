// contains a service that handles communication between react and the
// serverside API

class MyService {
  #AuthCodeUseCounter = 0;
  #AuthCode = this.getAuthCode();
  #RefreshToken = this.getRefreshToken();

  getMe() {
    // queries the serverside api, prevents the authcode from being used
    // more than once

    if (!this.#AuthCode && ! this.#RefreshToken) {
      return Promise.reject('no login creds')
    }

    if (this.#AuthCode && !this.#RefreshToken) {
      if (this.#AuthCodeUseCounter > 0) {
        this.#AuthCode = '';
        return Promise.reject('authcode can only be used once');
      }

      this.#AuthCodeUseCounter += 1;
    }

    return fetch(
      '/api/me?' +
        new URLSearchParams({
          authCode: this.#AuthCode,
          refreshToken: this.#RefreshToken,
        })
    );
  }

  saveRefreshToken(refreshToken) {
    const oldToken = this.getRefreshToken();

    if (!oldToken || oldToken !== refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      this.#RefreshToken = refreshToken
    }
  }

  getAuthCode() {
    // gets authcode from url, returns empty string if not found
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const authCode = urlParams.get('code');
    return authCode;
  }

  getRefreshToken() {
    // gets refresh token from local storage, returns empty string if not found
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && refreshToken !== 'null') {
      return refreshToken;
    }
    return '';
  }
}

const apiHandler = new MyService();
export default apiHandler;
