import type { Browser, Page } from "@playwright/test";

export interface Credentials {
  username: string;
  password: string;
}

/** `${prefix}_USER` and `${prefix}_PASSWORD`; throws naming whichever is unset. */
export function credentialsFromEnv(prefix: string): Credentials {
  const username = process.env[`${prefix}_USER`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!username || !password) {
    const missing = [!username && `${prefix}_USER`, !password && `${prefix}_PASSWORD`];
    throw new Error(`Set ${missing.filter(Boolean).join(" and ")} to sign in.`);
  }
  return { username, password };
}

export interface SignedInStateOptions {
  baseURL: string;
  /** Where to write the storage state; give each user and worker its own file. */
  file: string;
  /** Signs in on a page already at `baseURL`, and resolves once the app holds the session. */
  signIn: (page: Page) => Promise<void>;
  ignoreHTTPSErrors?: boolean;
}

/** Signs in once in a throwaway context and saves its storage state, for `use: { storageState }`. */
export async function signedInState(
  browser: Browser,
  { baseURL, file, signIn, ignoreHTTPSErrors }: SignedInStateOptions,
): Promise<string> {
  const context = await browser.newContext({ baseURL, ignoreHTTPSErrors });
  try {
    const page = await context.newPage();
    await page.goto(baseURL);
    await signIn(page);
    await context.storageState({ path: file });
  } finally {
    await context.close();
  }
  return file;
}
