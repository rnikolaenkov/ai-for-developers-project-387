import { expect, test, type Page } from "@playwright/test";
import { CONFLICT_GUEST, EVENT_TYPE, EXPECTED_SLOT, PRIMARY_GUEST, formatSlotLabel, formatUiDateTime } from "./helpers/calendar";

const slotLabel = formatSlotLabel(EXPECTED_SLOT.startsAt, EXPECTED_SLOT.endsAt);

test("calendar booking flows from the specification", async ({ browser, page }) => {
  await createEventType(page);
  const stalePage = await browser.newPage();
  await prepareBooking(stalePage, CONFLICT_GUEST);
  await createBooking(page, PRIMARY_GUEST);
  await expectConflict(stalePage);
  await stalePage.close();
  await assertBookingInAdmin(page);
});

async function createEventType(page: Page) {
  await page.goto("/admin/event-types");

  await page.getByPlaceholder("strategy-session").fill(EVENT_TYPE.id);
  await page.getByPlaceholder("Strategy Session").fill(EVENT_TYPE.name);
  await page.getByPlaceholder("45 минут на синхронизацию и разбор задач").fill(EVENT_TYPE.description);
  await page.getByTestId("event-type-duration").locator("input").fill(String(EVENT_TYPE.durationMinutes));
  await page.getByRole("button", { name: "Создать тип события" }).click();

  await expect(page.getByTestId("event-type-success")).toContainText("Тип события создан");
  await expect(page.getByRole("heading", { name: EVENT_TYPE.name, exact: true })).toBeVisible();
  await expect(page.locator(".event-type-grid")).toContainText(EVENT_TYPE.description);
}

async function createBooking(page: Page, guest: { name: string; email: string }) {
  await prepareBooking(page, guest);
  await page.getByRole("button", { name: "Забронировать слот" }).click();

  await expect(page.getByTestId("booking-success")).toContainText("Бронирование создано");
  await expect(page.getByTestId("booking-success")).toContainText(EVENT_TYPE.name);
  await expect(page.getByTestId("booking-success")).toContainText(formatUiDateTime(EXPECTED_SLOT.startsAt));
  await expect(page.getByTestId("booking-success")).toContainText(`${guest.name} (${guest.email})`);
}

async function expectConflict(page: Page) {
  await page.getByRole("button", { name: "Забронировать слот" }).click();

  await expect(page.getByTestId("booking-error")).toContainText("slot_conflict");
}

async function assertBookingInAdmin(page: Page) {
  await page.goto("/admin/bookings");

  await expect(page.getByTestId("bookings-table")).toContainText(EVENT_TYPE.name);
  await expect(page.getByTestId("bookings-table")).toContainText(PRIMARY_GUEST.name);
  await expect(page.getByTestId("bookings-table")).toContainText(PRIMARY_GUEST.email);
  await expect(page.getByTestId("bookings-table")).toContainText(formatUiDateTime(EXPECTED_SLOT.startsAt));
}

async function prepareBooking(page: Page, guest: { name: string; email: string }) {
  await page.goto("/booking");

  await page.getByRole("button", { name: "Показать слоты" }).click();
  await expect(page.getByTestId("slot-list")).toContainText(slotLabel);
  await page.getByRole("button", { name: slotLabel }).click();

  await page.getByPlaceholder("Иван Иванов").fill(guest.name);
  await page.getByPlaceholder("guest@example.com").fill(guest.email);
}
