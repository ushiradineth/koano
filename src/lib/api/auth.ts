import { env } from "@/env.mjs";
import { HttpCode, Status, SuccessResponse } from "@/lib/api/types";
import { User } from "@/lib/types";

const BASE_URL = env.NEXT_PUBLIC_API_URL + "/auth";

// ---

interface AuthenticateRequest {
  email: string;
  password: string;
}

interface AuthenticateResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
    token_type: string;
  };
}

export const authenticate = async ({
  email,
  password,
}: AuthenticateRequest): Promise<AuthenticateResponse> => {
  const url = BASE_URL + "/login";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return await response.json();
};

// ---

interface RefreshAccessTokenRequest {
  refresh_token: string;
  access_token: string;
}

interface RefreshAccessTokenResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: {
    refresh_token: string;
    access_token: string;
    expires_at: number;
    expires_in: number;
    token_type: string;
  };
}

export const refreshAccessToken = async ({
  refresh_token,
  access_token,
}: RefreshAccessTokenRequest): Promise<RefreshAccessTokenResponse> => {
  const url = BASE_URL + "/refresh";
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${access_token}`,
    },
    method: "POST",
    body: JSON.stringify({
      refresh_token: refresh_token as string,
    }),
  });

  return await response.json();
};

// ---
