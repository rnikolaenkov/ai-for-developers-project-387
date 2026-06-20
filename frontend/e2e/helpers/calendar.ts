export const FIXED_NOW = "2026-06-20T08:00:00.000Z";

export const EVENT_TYPE = {
  id: "strategy-session",
  name: "Strategy Session",
  description: "45 минут на синхронизацию и разбор задач",
  durationMinutes: 45,
};

export const PRIMARY_GUEST = {
  name: "Иван Иванов",
  email: "ivan@example.com",
};

export const CONFLICT_GUEST = {
  name: "Пётр Петров",
  email: "petr@example.com",
};

export const EXPECTED_SLOT = {
  startsAt: "2026-06-20T10:00:00.000Z",
  endsAt: "2026-06-20T10:45:00.000Z",
};

export function formatUiDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatSlotLabel(startsAt: string, endsAt: string) {
  return `${formatUiDateTime(startsAt)} - ${formatUiDateTime(endsAt)}`;
}
