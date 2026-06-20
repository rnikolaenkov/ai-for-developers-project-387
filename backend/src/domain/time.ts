import type { Booking } from "../types/api.js";

const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 18;
const SLOT_STEP_MINUTES = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface AvailabilityWindow {
  windowStartsAt: Date;
  windowEndsAt: Date;
}

export function parseTimestamp(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  return date;
}

export function isIsoTimestamp(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export function toTimestamp(value: Date): string {
  return value.toISOString();
}

export function addMinutes(value: Date, minutes: number): Date {
  return new Date(value.getTime() + minutes * 60 * 1000);
}

export function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * DAY_MS);
}

export function getAvailabilityWindow(from: Date | undefined, days: number | undefined, now: Date): AvailabilityWindow {
  const windowStartsAt = from ?? now;
  const resolvedDays = days ?? 14;

  return {
    windowStartsAt,
    windowEndsAt: addDays(windowStartsAt, resolvedDays),
  };
}

export function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 0, 0, 0, 0));
}

export function getWorkdayBounds(day: Date) {
  const year = day.getUTCFullYear();
  const month = day.getUTCMonth();
  const date = day.getUTCDate();

  return {
    start: new Date(Date.UTC(year, month, date, WORKDAY_START_HOUR, 0, 0, 0)),
    end: new Date(Date.UTC(year, month, date, WORKDAY_END_HOUR, 0, 0, 0)),
  };
}

export function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

export function slotFitsWorkday(slotStart: Date, slotEnd: Date): boolean {
  const { start, end } = getWorkdayBounds(slotStart);
  return slotStart >= start && slotEnd <= end;
}

export function slotIsFree(bookings: Booking[], slotStart: Date, slotEnd: Date): boolean {
  return bookings.every((booking) => {
    const bookingStart = parseTimestamp(booking.startsAt);
    const bookingEnd = parseTimestamp(booking.endsAt);
    return !overlaps(slotStart, slotEnd, bookingStart, bookingEnd);
  });
}

export function alignToNextStep(value: Date): Date {
  const aligned = new Date(value);
  aligned.setUTCSeconds(0, 0);

  const minutes = aligned.getUTCMinutes();
  const remainder = minutes % SLOT_STEP_MINUTES;

  if (remainder !== 0) {
    aligned.setUTCMinutes(minutes + (SLOT_STEP_MINUTES - remainder));
  }

  return aligned;
}
