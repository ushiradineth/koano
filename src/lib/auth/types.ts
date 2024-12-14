import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    expires_at?: number;
    expires_in?: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}

declare module "next-auth" {
  interface User {
    email?: string | null;
    name?: string | null;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
  }

  interface Session extends DefaultSession {
    user: User;
    error?: "RefreshTokenError";
  }
}
