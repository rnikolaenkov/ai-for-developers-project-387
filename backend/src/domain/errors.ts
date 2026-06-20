import type { ApiErrorPayload } from "../types/api.js";

export class AppError extends Error {
  statusCode: ApiErrorPayload["statusCode"];
  code: ApiErrorPayload["code"];

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "AppError";
    this.statusCode = payload.statusCode;
    this.code = payload.code;
  }

  toResponse(): ApiErrorPayload {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
    };
  }
}

export function validationError(message: string) {
  return new AppError({
    statusCode: 422,
    code: "validation_error",
    message,
  });
}

export function notFoundError(message: string) {
  return new AppError({
    statusCode: 404,
    code: "not_found",
    message,
  });
}

export function slotConflictError(message: string) {
  return new AppError({
    statusCode: 409,
    code: "slot_conflict",
    message,
  });
}

export function duplicateResourceError(message: string) {
  return new AppError({
    statusCode: 409,
    code: "duplicate_resource",
    message,
  });
}
