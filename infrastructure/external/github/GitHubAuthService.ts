// infrastructure/external/github/GitHubAuthService.ts

export interface GitHubAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export class GitHubAuthService {
  private readonly authURL = 'https://github.com/login/oauth';
  private readonly apiURL = 'https://api.github.com';

  constructor(private config: GitHubAuthConfig) {
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new Error('GitHub auth configuration is incomplete');
    }
  }

  getAuthorizationURL(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'repo read:user',
      ...(state && { state }),
    });

    return `${this.authURL}/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch(`${this.authURL}/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data: GitHubTokenResponse = await response.json();
    return data.access_token;
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiURL}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async getUserInfo(accessToken: string) {
    const response = await fetch(`${this.apiURL}/user`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }
}
