import { env } from "@/env.mjs";
import { HttpCode, Status, SuccessResponse } from "@/lib/api/types";
import { User } from "@/lib/types";

const BASE_URL = `${env.NEXT_PUBLIC_API_URL}/users`;

// ---

interface GetRequest {
  id: string;
  access_token: string;
}

interface GetResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: User;
}

export async function get({
  id,
  access_token,
}: GetRequest): Promise<GetResponse> {
  const url = `${BASE_URL}/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  return await response.json();
}

// ---

interface PostRequest {
  name: string;
  email: string;
  password: string;
}

interface PostResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: User;
}

export async function post({
  name,
  email,
  password,
}: PostRequest): Promise<PostResponse> {
  const url = BASE_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return await response.json();
}

// ---

interface PutRequest {
  id: string;
  name: string;
  email: string;
  access_token: string;
}

interface PutResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: User;
}

export async function put({
  id,
  name,
  email,
  access_token,
}: PutRequest): Promise<PutResponse> {
  const url = `${BASE_URL}/${id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ name, email }),
  });

  return await response.json();
}

// ---

interface DeleteRequest {
  id: string;
  access_token: string;
}

interface DeleteResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: string;
}

export async function deleteUser({
  id,
  access_token,
}: DeleteRequest): Promise<DeleteResponse> {
  const url = `${BASE_URL}/${id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  return await response.json();
}
