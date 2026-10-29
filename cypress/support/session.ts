export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    name: string;
    role: string;
    show_in_global_ranking?: boolean;
  };
};

/** Mesma chave de src/lib/auth-storage.ts. */
export const SESSION_KEY = "levelup-english:session";
