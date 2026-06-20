import type {
  AvailabilityResponse,
  AvailableSlot,
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  PublicEventType,
} from "../types/api.js";
import { duplicateResourceError, notFoundError, slotConflictError, validationError } from "./errors.js";
import {
  addDays,
  addMinutes,
  alignToNextStep,
  getAvailabilityWindow,
  getWorkdayBounds,
  parseTimestamp,
  slotFitsWorkday,
  slotIsFree,
  startOfUtcDay,
  toTimestamp,
} from "./time.js";
import { validateCreateBookingInput, validateCreateEventTypeInput } from "./validation.js";
import type { MemoryStore } from "../store/memoryStore.js";

export interface BookingServiceOptions {
  store: MemoryStore;
  now?: () => Date;
}

export class BookingService {
  private readonly store: MemoryStore;
  private readonly now: () => Date;

  constructor({ store, now = () => new Date() }: BookingServiceOptions) {
    this.store = store;
    this.now = now;
  }

  createEventType(input: unknown): EventType {
    const payload = validateCreateEventTypeInput(input);

    if (this.store.getEventType(payload.id)) {
      throw duplicateResourceError(`Event type with id "${payload.id}" already exists`);
    }

    return this.store.saveEventType(payload);
  }

  listEventTypes(): EventType[] {
    return this.store.listEventTypes();
  }

  listPublicEventTypes(): PublicEventType[] {
    return this.store.listEventTypes().map(({ id, name, description, durationMinutes }) => ({
      id,
      name,
      description,
      durationMinutes,
    }));
  }

  listUpcomingBookings(from?: Date): Booking[] {
    const now = this.now();
    const effectiveFrom = from && from > now ? from : now;

    return this.store
      .listBookings()
      .filter((booking) => parseTimestamp(booking.startsAt) >= effectiveFrom)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  }

  getAvailability(eventTypeId: string, from?: Date, days?: number): AvailabilityResponse {
    const eventType = this.store.getEventType(eventTypeId);

    if (!eventType) {
      throw notFoundError(`Event type "${eventTypeId}" was not found`);
    }

    const window = getAvailabilityWindow(from, days, this.now());
    const slots = this.generateAvailableSlots(eventType, window.windowStartsAt, window.windowEndsAt);

    return {
      eventTypeId,
      windowStartsAt: toTimestamp(window.windowStartsAt),
      windowEndsAt: toTimestamp(window.windowEndsAt),
      slots,
    };
  }

  createBooking(input: unknown): Booking {
    const payload = validateCreateBookingInput(input);
    const eventType = this.store.getEventType(payload.eventTypeId);

    if (!eventType) {
      throw notFoundError(`Event type "${payload.eventTypeId}" was not found`);
    }

    const slotStart = parseTimestamp(payload.slotStartsAt);
    const slotEnd = addMinutes(slotStart, eventType.durationMinutes);
    const window = getAvailabilityWindow(undefined, undefined, this.now());

    if (slotStart < window.windowStartsAt || slotEnd > window.windowEndsAt) {
      throw validationError("Selected slot is outside the allowed booking window");
    }

    if (!slotFitsWorkday(slotStart, slotEnd)) {
      throw validationError("Selected slot is outside working hours");
    }

    const slots = this.generateAvailableSlots(eventType, window.windowStartsAt, window.windowEndsAt);
    const isKnownSlot = slots.some((slot) => slot.startsAt === toTimestamp(slotStart));

    if (!isKnownSlot) {
      throw slotConflictError("Selected slot is no longer available");
    }

    if (!slotIsFree(this.store.listBookings(), slotStart, slotEnd)) {
      throw slotConflictError("Selected slot is already booked");
    }

    const booking: Booking = {
      id: `booking-${crypto.randomUUID()}`,
      eventTypeId: eventType.id,
      eventTypeName: eventType.name,
      startsAt: toTimestamp(slotStart),
      endsAt: toTimestamp(slotEnd),
      durationMinutes: eventType.durationMinutes,
      guest: payload.guest,
      createdAt: toTimestamp(this.now()),
    };

    return this.store.saveBooking(booking);
  }

  private generateAvailableSlots(eventType: EventType, windowStartsAt: Date, windowEndsAt: Date): AvailableSlot[] {
    const bookings = this.store.listBookings();
    const result: AvailableSlot[] = [];
    const firstDay = startOfUtcDay(windowStartsAt);
    const lastDayExclusive = addDays(startOfUtcDay(windowEndsAt), 1);

    for (let day = new Date(firstDay); day < lastDayExclusive; day = addDays(day, 1)) {
      const { start, end } = getWorkdayBounds(day);
      const firstCandidate = alignToNextStep(windowStartsAt > start ? windowStartsAt : start);

      for (let slotStart = new Date(firstCandidate); slotStart < end; slotStart = addMinutes(slotStart, 30)) {
        if (slotStart < start) {
          continue;
        }

        const slotEnd = addMinutes(slotStart, eventType.durationMinutes);

        if (slotEnd > end || slotEnd > windowEndsAt || slotStart < windowStartsAt) {
          continue;
        }

        if (slotIsFree(bookings, slotStart, slotEnd)) {
          result.push({
            startsAt: toTimestamp(slotStart),
            endsAt: toTimestamp(slotEnd),
          });
        }
      }
    }

    return result.sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  }
}
