export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  user: { _id: string; name: string; role: string };
};

/** Mesma chave de src/lib/auth-storage.ts. */
export const SESSION_KEY = "levelup-english:session";
