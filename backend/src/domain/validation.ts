import type { CreateBookingRequest, CreateEventTypeRequest, GuestContact } from "../types/api.js";
import { validationError } from "./errors.js";
import { isIsoTimestamp, parseTimestamp } from "./time.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function assertDurationMinutes(value: unknown, fieldName: string) {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 1440) {
    throw validationError(`${fieldName} must be an integer between 1 and 1440`);
  }
}

export function assertGuestContact(guest: unknown): asserts guest is GuestContact {
  if (typeof guest !== "object" || guest === null) {
    throw validationError("guest is required");
  }

  const value = guest as Partial<GuestContact>;

  if (!hasText(value.name)) {
    throw validationError("guest.name is required");
  }

  if (!hasText(value.email) || !EMAIL_RE.test(value.email.trim())) {
    throw validationError("guest.email must be a valid email");
  }
}

export function validateCreateEventTypeInput(input: unknown): CreateEventTypeRequest {
  if (typeof input !== "object" || input === null) {
    throw validationError("Request body must be an object");
  }

  const value = input as Partial<CreateEventTypeRequest>;

  if (!hasText(value.id)) {
    throw validationError("id is required");
  }

  if (!hasText(value.name)) {
    throw validationError("name is required");
  }

  if (!hasText(value.description)) {
    throw validationError("description is required");
  }

  assertDurationMinutes(value.durationMinutes, "durationMinutes");

  return {
    id: value.id.trim(),
    name: value.name.trim(),
    description: value.description.trim(),
    durationMinutes: Number(value.durationMinutes),
  };
}

export function validateCreateBookingInput(input: unknown): CreateBookingRequest {
  if (typeof input !== "object" || input === null) {
    throw validationError("Request body must be an object");
  }

  const value = input as Partial<CreateBookingRequest>;

  if (!hasText(value.eventTypeId)) {
    throw validationError("eventTypeId is required");
  }

  if (!hasText(value.slotStartsAt) || !isIsoTimestamp(value.slotStartsAt)) {
    throw validationError("slotStartsAt must be a valid RFC 3339 timestamp");
  }

  assertGuestContact(value.guest);
  parseTimestamp(value.slotStartsAt);

  return {
    eventTypeId: value.eventTypeId.trim(),
    slotStartsAt: value.slotStartsAt,
    guest: {
      name: value.guest.name.trim(),
      email: value.guest.email.trim(),
    },
  };
}

export function validateOptionalTimestamp(value: unknown, fieldName: string): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !isIsoTimestamp(value)) {
    throw validationError(`${fieldName} must be a valid RFC 3339 timestamp`);
  }

  return parseTimestamp(value);
}

export function validateOptionalDays(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 14) {
    throw validationError("days must be an integer between 1 and 14");
  }

  return parsed;
}
