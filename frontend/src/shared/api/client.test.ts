import { describe, expect, it, vi } from "vitest";
import { api, ApiClientError, normalizeApiError } from "./client";

describe("normalizeApiError", () => {
  it("returns ui-friendly payload when contract error body exists", () => {
    const response = new Response(null, { status: 409, statusText: "Conflict" });

    expect(
      normalizeApiError(response, {
        statusCode: 409,
        code: "slot_conflict",
        message: "Slot is already booked",
      }),
    ).toEqual({
      statusCode: 409,
      code: "slot_conflict",
      message: "Slot is already booked",
    });
  });

  it("falls back to generic payload when response is not contract-shaped", () => {
    const response = new Response(null, { status: 500, statusText: "Internal Server Error" });

    expect(normalizeApiError(response, { foo: "bar" })).toEqual({
      statusCode: 500,
      code: "unknown_error",
      message: "Internal Server Error",
    });
  });
});

describe("api client", () => {
  it("maps availability query params", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          eventTypeId: "demo",
          windowStartsAt: "2026-06-20T10:00:00Z",
          windowEndsAt: "2026-06-21T10:00:00Z",
          slots: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await api.getAvailability("demo", "2026-06-20T10:00:00.000Z", 7);

    expect(fetchSpy).toHaveBeenCalledWith(
      `${window.location.origin}/event-types/demo/availability?from=2026-06-20T10%3A00%3A00.000Z&days=7`,
      expect.any(Object),
    );
  });

  it("throws ApiClientError for contract errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: 422,
          code: "validation_error",
          message: "Name is required",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(api.listEventTypes()).rejects.toBeInstanceOf(ApiClientError);
  });
});
