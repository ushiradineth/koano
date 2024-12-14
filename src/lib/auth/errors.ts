import { CredentialsSignin } from "next-auth";

export class ServerError extends CredentialsSignin {
  code = "404";
}

export class InvalidCredentialsError extends CredentialsSignin {
  code = "401";
}
