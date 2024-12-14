import { env } from "@/env.mjs";
import { InvalidCredentialsError, ServerError } from "@/lib/auth/errors";
import { SuccessResponse } from "@/lib/types";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
        const url =
          env.NEXT_PUBLIC_API_URL +
          "/auth/login?" +
          new URLSearchParams({
            email: email as string,
            password: password as string,
          });

        let response: Response;

        try {
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Server Error");
          throw new ServerError();
        }

        if (response.status !== 200) {
          throw new InvalidCredentialsError();
        }

        const body: SuccessResponse = await response.json();

        return {
          id: body.data.user.id,
          email: body.data.user.email,
          name: body.data.user.name,
          access_token: body.data.access_token,
          refresh_token: body.data.refresh_token,
          expires_at: body.data.expires_at,
          expires_in: body.data.expires_in,
        };
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
        return await refreshAccessToken(token);
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      if (!token.sub || !token.email || !token.name) return session;

      session.user.id = token.sub;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.access_token = token.access_token ?? "";
      return session;
    },
  },
});

async function refreshAccessToken(token: any) {
  if (!token.refresh_token) throw new TypeError("Missing refresh_token");

  try {
    const url =
      env.NEXT_PUBLIC_API_URL +
      "/auth/refresh?" +
      new URLSearchParams({
        refresh_token: token.refreshToken as string,
      });

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const body: SuccessResponse = await response.json();

    if (!response.ok) throw body;

    token.access_token = body.data.access_token;
    token.expires_at = body.data.expires_at;
    token.expires_in = body.data.expires_in;
    token.refresh_token = body.data.refresh_token;

    return token;
  } catch (error) {
    console.error("Error refreshing access_token", error);
    token.error = "RefreshTokenError";
    return token;
  }
}
