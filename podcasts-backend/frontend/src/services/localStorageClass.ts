const TOKEN_KEY =
  'audio_player_token';
const USERNAME_KEY =
  'audio_player_username';
export class LocalStorageClass {
  public getToken(): string | null {
    return localStorage.getItem(
      TOKEN_KEY,
    );
  }
  public setToken(
    token: string,
  ): void {
    localStorage.setItem(
      TOKEN_KEY,
      token,
    );
  }
  public removeToken(): void {
    localStorage.removeItem(
      TOKEN_KEY,
    );
  }
  public getUsername(): string | null {
    return localStorage.getItem(
      USERNAME_KEY,
    );
  }
  public setUsername(
    username: string,
  ): void {
    localStorage.setItem(
      USERNAME_KEY,
      username,
    );
  }
  public removeUsername(): void {
    localStorage.removeItem(
      USERNAME_KEY,
    );
  }
  public clear(): void {
    this.removeToken();
    this.removeUsername();
  }
}