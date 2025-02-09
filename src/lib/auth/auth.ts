import { authenticate, refreshAccessToken } from "@/lib/api/auth";
import { ErrorResponse, HttpCode } from "@/lib/api/types";
import { InvalidCredentialsError, ServerError } from "@/lib/auth/errors";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { useContextStore } from "../stores/context";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize({ email, password }) {
        try {
          const response = await authenticate({
            email: email as string,
            password: password as string,
          });

          if (response.code !== HttpCode.Success) {
            throw new Error(String((response as any as ErrorResponse).code));
          }

          return {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_at: response.data.expires_at,
            expires_in: response.data.expires_in,
          };
        } catch (error: any) {
          if (error.message !== "401" && error.message !== "400") {
            throw new ServerError();
          }

          throw new InvalidCredentialsError();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        return {
          ...token,
          access_token: user.access_token,
          expires_at: user.expires_at,
          expires_in: user.expires_in,
          refresh_token: user.refresh_token,
        };
      } else if (Date.now() < (token.expires_at ?? 0) * 1000) {
        return token;
      } else {
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");
        if (!token.access_token) throw new TypeError("Missing access_token");

        try {
          const response = await refreshAccessToken({
            refresh_token: token.refresh_token,
            access_token: token.access_token,
          });

          if (response.code !== HttpCode.Success) {
            throw new Error((response as any as ErrorResponse).error);
          }

          token.access_token = response.data.access_token;
          token.expires_at = response.data.expires_at;
          token.expires_in = response.data.expires_in;
          token.refresh_token = response.data.refresh_token;
          token.error = undefined;

          return token;
        } catch (error) {
          console.error("Error refreshing access_token", error);
          token.error = "RefreshTokenError";
          await signOut();
          return token;
        }
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      if (!token.sub || !token.email || !token.name) return session;

      session.user.id = token.sub;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.access_token = token.access_token ?? "";
      useContextStore.getState().setAccessToken(token.access_token ?? "");
      return session;
    },
    async authorized({ auth }) {
      return !!auth;
    },
  },
});
