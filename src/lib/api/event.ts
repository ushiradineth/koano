import { env } from "@/env.mjs";
import { HttpCode, Status, SuccessResponse } from "@/lib/api/types";
import { Event, Repeated } from "@/lib/types";

const BASE_URL = `${env.NEXT_PUBLIC_API_URL}/events`;

// ---

interface GetRequest {
  start_day: string;
  end_day: string;
  access_token: string;
}

interface GetResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: Event[];
}

export async function get({
  start_day,
  end_day,
  access_token,
}: GetRequest): Promise<GetResponse> {
  const url = `${BASE_URL}?${new URLSearchParams({
    start_day,
    end_day,
  })}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${access_token}`,
    },
  });

  return await response.json();
}

// ---

interface GetByEventIdRequest {
  id: string;
  access_token: string;
}

interface GetByEventIdResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: Event;
}

export async function getByEventId({
  id,
  access_token,
}: GetByEventIdRequest): Promise<GetByEventIdResponse> {
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
  title: string;
  start_time: string;
  end_time: string;
  timezone: string;
  repeated: Repeated;
  access_token: string;
}

interface PostResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: Event;
}

export async function post({
  title,
  start_time,
  end_time,
  timezone,
  repeated,
  access_token,
}: PostRequest): Promise<PostResponse> {
  const url = BASE_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ title, start_time, end_time, timezone, repeated }),
  });

  return await response.json();
}

// ---

interface PutRequest {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  timezone: string;
  repeated: Repeated;
  access_token: string;
}

interface PutResponse extends SuccessResponse {
  code: HttpCode.Success;
  status: Status.Success;
  data: Event;
}

export async function put({
  id,
  title,
  start_time,
  end_time,
  timezone,
  repeated,
  access_token,
}: PutRequest): Promise<PutResponse> {
  const url = `${BASE_URL}/${id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ title, start_time, end_time, timezone, repeated }),
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

export async function deleteEvent({
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
