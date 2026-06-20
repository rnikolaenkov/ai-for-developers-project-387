import type { Booking, EventType } from "../types/api.js";

export class MemoryStore {
  private eventTypes = new Map<string, EventType>();
  private bookings: Booking[] = [];

  listEventTypes(): EventType[] {
    return Array.from(this.eventTypes.values());
  }

  getEventType(id: string): EventType | undefined {
    return this.eventTypes.get(id);
  }

  saveEventType(eventType: EventType): EventType {
    this.eventTypes.set(eventType.id, eventType);
    return eventType;
  }

  listBookings(): Booking[] {
    return [...this.bookings];
  }

  saveBooking(booking: Booking): Booking {
    this.bookings.push(booking);
    return booking;
  }
}
