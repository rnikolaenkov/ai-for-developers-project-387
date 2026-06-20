import type {
  AvailabilityResponse,
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  PublicEventType,
  UiApiError,
} from "./types";

const API_BASE_URL = resolveApiBaseUrl();

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export class ApiClientError extends Error {
  statusCode: number;
  code: string;

  constructor({ statusCode, code, message }: UiApiError) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export function normalizeApiError(response: Response, payload: unknown): UiApiError {
  if (typeof payload === "object" && payload !== null) {
    const maybePayload = payload as Partial<UiApiError>;

    if (typeof maybePayload.code === "string" && typeof maybePayload.message === "string") {
      return {
        statusCode: typeof maybePayload.statusCode === "number" ? maybePayload.statusCode : response.status,
        code: maybePayload.code,
        message: maybePayload.message,
      };
    }
  }

  return {
    statusCode: response.status,
    code: "unknown_error",
    message: response.statusText || "Request failed",
  };
}

export async function request<T>(path: string, init?: RequestInit, query?: Record<string, string | number | undefined>): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const hasJson = response.headers.get("content-type")?.includes("application/json");
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiClientError(normalizeApiError(response, payload));
  }

  return payload as T;
}

export const api = {
  listPublicEventTypes() {
    return request<PublicEventType[]>("/event-types");
  },

  getAvailability(eventTypeId: string, from?: string, days?: number) {
    return request<AvailabilityResponse>(`/event-types/${eventTypeId}/availability`, undefined, { from, days });
  },

  createBooking(input: CreateBookingRequest) {
    return request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listEventTypes() {
    return request<EventType[]>("/admin/event-types");
  },

  createEventType(input: CreateEventTypeRequest) {
    return request<EventType>("/admin/event-types", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listUpcomingBookings(from?: string) {
    return request<Booking[]>("/admin/bookings", undefined, { from });
  },
};
