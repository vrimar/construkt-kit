import type { AuthProvider, LoginOptions } from "@construkt-kit/pages";

interface Auth0ClientLike {
  getAccessTokenSilently(): Promise<string>;
  loginWithRedirect(options?: unknown): Promise<void>;
  logout(options?: { logoutParams?: { returnTo?: string } }): void | Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getUser(): Promise<{ sub?: string; email?: string; name?: string } | undefined>;
}

export function createAuth0AuthProvider(client: Auth0ClientLike): AuthProvider {
  return {
    getToken: () => client.getAccessTokenSilently().catch(() => null),
    login: (options?: LoginOptions) => client.loginWithRedirect(options),
    logout: () =>
      Promise.resolve(client.logout({ logoutParams: { returnTo: window.location.origin } })),
    isAuthenticated: async () => {
      try {
        return await client.isAuthenticated();
      } catch {
        return false;
      }
    },
    getUser: async () => {
      try {
        const user = await client.getUser();
        if (!user?.sub) return null;
        return {
          id: user.sub,
          email: user.email ?? "",
          name: user.name,
        };
      } catch {
        return null;
      }
    },
  };
}
