import { describe, expect, it } from "vitest";
import { BookingService } from "../src/domain/bookingService.js";
import { AppError } from "../src/domain/errors.js";
import { MemoryStore } from "../src/store/memoryStore.js";

function createService(now = "2026-06-20T08:00:00.000Z") {
  return new BookingService({
    store: new MemoryStore(),
    now: () => new Date(now),
  });
}

describe("BookingService", () => {
  it("creates event types and rejects duplicates", () => {
    const service = createService();

    const created = service.createEventType({
      id: "strategy",
      name: "Strategy Session",
      description: "45 minutes",
      durationMinutes: 45,
    });

    expect(created.id).toBe("strategy");
    expect(() =>
      service.createEventType({
        id: "strategy",
        name: "Duplicate",
        description: "Duplicate",
        durationMinutes: 30,
      }),
    ).toThrow(AppError);
  });

  it("returns availability for free slots and hides occupied intervals", () => {
    const service = createService();
    service.createEventType({
      id: "strategy",
      name: "Strategy Session",
      description: "45 minutes",
      durationMinutes: 45,
    });

    const beforeBooking = service.getAvailability("strategy");
    expect(beforeBooking.slots.some((slot) => slot.startsAt === "2026-06-20T09:00:00.000Z")).toBe(true);

    service.createBooking({
      eventTypeId: "strategy",
      slotStartsAt: "2026-06-20T09:00:00.000Z",
      guest: {
        name: "Ivan",
        email: "ivan@example.com",
      },
    });

    const afterBooking = service.getAvailability("strategy");
    expect(afterBooking.slots.some((slot) => slot.startsAt === "2026-06-20T09:00:00.000Z")).toBe(false);
    expect(afterBooking.slots.some((slot) => slot.startsAt === "2026-06-20T09:30:00.000Z")).toBe(false);
  });

  it("rejects bookings outside the allowed window", () => {
    const service = createService();
    service.createEventType({
      id: "deep-work",
      name: "Deep Work",
      description: "60 minutes",
      durationMinutes: 60,
    });

    expect(() =>
      service.createBooking({
        eventTypeId: "deep-work",
        slotStartsAt: "2026-07-05T09:00:00.000Z",
        guest: {
          name: "Ivan",
          email: "ivan@example.com",
        },
      }),
    ).toThrow(AppError);
  });

  it("rejects missing event types and slot conflicts", () => {
    const service = createService();
    service.createEventType({
      id: "consulting",
      name: "Consulting",
      description: "30 minutes",
      durationMinutes: 30,
    });

    expect(() =>
      service.createBooking({
        eventTypeId: "unknown",
        slotStartsAt: "2026-06-20T10:00:00.000Z",
        guest: {
          name: "Ivan",
          email: "ivan@example.com",
        },
      }),
    ).toThrow(AppError);

    service.createBooking({
      eventTypeId: "consulting",
      slotStartsAt: "2026-06-20T10:00:00.000Z",
      guest: {
        name: "Ivan",
        email: "ivan@example.com",
      },
    });

    expect(() =>
      service.createBooking({
        eventTypeId: "consulting",
        slotStartsAt: "2026-06-20T10:00:00.000Z",
        guest: {
          name: "Petr",
          email: "petr@example.com",
        },
      }),
    ).toThrow(AppError);
  });
});
