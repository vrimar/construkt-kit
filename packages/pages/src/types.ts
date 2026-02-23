export interface LoginOptions {
  redirectUri?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * Auth provider adapter interface.
 * Implement against whichever auth SDK the consuming app uses (MSAL, Auth0, etc.)
 * and pass the implementation to shared page components.
 */
export interface AuthProvider {
  getToken: () => Promise<string | null>;
  login: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean> | boolean;
  getUser: () => Promise<User | null> | User | null;
}
