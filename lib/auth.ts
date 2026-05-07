const authStorageKey = "wcs.auth.session";

export type AuthSession = {
  username: string;
  signedInAt: string;
};

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(authStorageKey);

  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    window.localStorage.removeItem(authStorageKey);

    return null;
  }
}

export function signIn(username: string) {
  const session: AuthSession = {
    username,
    signedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    authStorageKey,
    JSON.stringify(session)
  );

  return session;
}

export function signOut() {
  window.localStorage.removeItem(authStorageKey);
}
