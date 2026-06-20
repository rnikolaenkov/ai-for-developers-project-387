import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

const NOW = "2026-06-20T08:00:00.000Z";

describe("backend routes", () => {
  const appPromise = buildApp({
    now: () => new Date(NOW),
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("supports the main admin and public booking flow", async () => {
    const app = await appPromise;

    const createEventType = await app.inject({
      method: "POST",
      url: "/admin/event-types",
      payload: {
        id: "strategy",
        name: "Strategy Session",
        description: "45 minutes",
        durationMinutes: 45,
      },
    });

    expect(createEventType.statusCode).toBe(201);

    const listAdminEventTypes = await app.inject({
      method: "GET",
      url: "/admin/event-types",
    });

    expect(listAdminEventTypes.statusCode).toBe(200);
    expect(listAdminEventTypes.json()).toHaveLength(1);

    const listPublicEventTypes = await app.inject({
      method: "GET",
      url: "/event-types",
    });

    expect(listPublicEventTypes.statusCode).toBe(200);
    expect(listPublicEventTypes.json()).toHaveLength(1);

    const availability = await app.inject({
      method: "GET",
      url: "/event-types/strategy/availability?from=2026-06-20T09:00:00.000Z&days=1",
    });

    expect(availability.statusCode).toBe(200);
    expect(availability.json().slots.length).toBeGreaterThan(0);

    const booking = await app.inject({
      method: "POST",
      url: "/bookings",
      payload: {
        eventTypeId: "strategy",
        slotStartsAt: "2026-06-20T10:00:00.000Z",
        guest: {
          name: "Ivan",
          email: "ivan@example.com",
        },
      },
    });

    expect(booking.statusCode).toBe(201);
    expect(booking.json().eventTypeName).toBe("Strategy Session");

    const conflict = await app.inject({
      method: "POST",
      url: "/bookings",
      payload: {
        eventTypeId: "strategy",
        slotStartsAt: "2026-06-20T10:00:00.000Z",
        guest: {
          name: "Petr",
          email: "petr@example.com",
        },
      },
    });

    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toMatchObject({
      statusCode: 409,
      code: "slot_conflict",
    });

    const bookings = await app.inject({
      method: "GET",
      url: "/admin/bookings?from=2026-06-20T09:30:00.000Z",
    });

    expect(bookings.statusCode).toBe(200);
    expect(bookings.json()).toHaveLength(1);
  });

  it("returns contract-shaped validation and not-found errors", async () => {
    const app = await appPromise;

    const notFound = await app.inject({
      method: "GET",
      url: "/event-types/missing/availability",
    });

    expect(notFound.statusCode).toBe(404);
    expect(notFound.json()).toMatchObject({
      statusCode: 404,
      code: "not_found",
    });

    const invalidDays = await app.inject({
      method: "GET",
      url: "/event-types/strategy/availability?days=30",
    });

    expect(invalidDays.statusCode).toBe(422);
    expect(invalidDays.json()).toMatchObject({
      statusCode: 422,
      code: "validation_error",
    });
  });

  it("exposes a health check endpoint", async () => {
    const app = await appPromise;

    const health = await app.inject({
      method: "GET",
      url: "/healthz",
    });

    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok" });
  });
});
