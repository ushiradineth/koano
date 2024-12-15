export enum HttpCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Error = 500,
}

export enum Status {
  Success = "success",
  Fail = "fail",
  Error = "error",
}

export type SuccessResponse = {
  code: HttpCode;
  status: Status;
  data: any;
};

export type ErrorResponse = {
  code: HttpCode;
  status: Status;
  error: any;
};
