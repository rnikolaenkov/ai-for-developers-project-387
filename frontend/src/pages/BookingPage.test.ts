import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import BookingPage from "./BookingPage.vue";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("BookingPage", () => {
  it("renders event types and completes happy path booking flow", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: "strategy",
            name: "Strategy Session",
            description: "45 minutes",
            durationMinutes: 45,
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          eventTypeId: "strategy",
          windowStartsAt: "2026-06-20T09:00:00Z",
          windowEndsAt: "2026-06-21T09:00:00Z",
          slots: [
            {
              startsAt: "2026-06-20T10:00:00Z",
              endsAt: "2026-06-20T10:45:00Z",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: "booking-1",
          eventTypeId: "strategy",
          eventTypeName: "Strategy Session",
          startsAt: "2026-06-20T10:00:00Z",
          endsAt: "2026-06-20T10:45:00Z",
          durationMinutes: 45,
          guest: {
            name: "Иван",
            email: "ivan@example.com",
          },
          createdAt: "2026-06-19T09:00:00Z",
        }),
      );

    const wrapper = mount(BookingPage, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await flushPromises();
    expect(wrapper.text()).toContain("Strategy Session");

    const selectButton = wrapper.findAll("button").find((button) => button.text().includes("Показать слоты"));
    expect(selectButton).toBeDefined();
    await selectButton?.trigger("click");
    await flushPromises();

    const buttons = wrapper.findAll("button");
    const slotButton = buttons.find((button) => button.text().includes("20 июн."));
    expect(slotButton).toBeDefined();
    await slotButton?.trigger("click");

    await wrapper.find('input[placeholder="Иван Иванов"]').setValue("Иван");
    await wrapper.find('input[placeholder="guest@example.com"]').setValue("ivan@example.com");

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Бронирование создано");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
