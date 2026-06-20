export type EntityId = string;
export type Timestamp = string;

export interface GuestContact {
  name: string;
  email: string;
}

export interface EventType {
  id: EntityId;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface PublicEventType {
  id: EntityId;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface CreateEventTypeRequest {
  id: EntityId;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Booking {
  id: EntityId;
  eventTypeId: EntityId;
  eventTypeName: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  durationMinutes: number;
  guest: GuestContact;
  createdAt: Timestamp;
}

export interface AvailableSlot {
  startsAt: Timestamp;
  endsAt: Timestamp;
}

export interface AvailabilityResponse {
  eventTypeId: EntityId;
  windowStartsAt: Timestamp;
  windowEndsAt: Timestamp;
  slots: AvailableSlot[];
}

export interface CreateBookingRequest {
  eventTypeId: EntityId;
  slotStartsAt: Timestamp;
  guest: GuestContact;
}

export interface ValidationError {
  statusCode: 422;
  code: "validation_error";
  message: string;
}

export interface NotFoundError {
  statusCode: 404;
  code: "not_found";
  message: string;
}

export interface SlotConflictError {
  statusCode: 409;
  code: "slot_conflict";
  message: string;
}

export interface DuplicateResourceError {
  statusCode: 409;
  code: "duplicate_resource";
  message: string;
}

export type ApiErrorPayload =
  | ValidationError
  | NotFoundError
  | SlotConflictError
  | DuplicateResourceError;

export interface UiApiError {
  statusCode: number;
  code: string;
  message: string;
}
