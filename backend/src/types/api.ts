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

export interface ApiErrorPayload {
  statusCode: 404 | 409 | 422;
  code: "not_found" | "slot_conflict" | "duplicate_resource" | "validation_error";
  message: string;
}
