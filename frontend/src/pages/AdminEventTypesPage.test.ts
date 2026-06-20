import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import AdminEventTypesPage from "./AdminEventTypesPage.vue";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AdminEventTypesPage", () => {
  it("increments duration by 10 minutes from the default value", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));

    const wrapper = mount(AdminEventTypesPage, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await flushPromises();

    const durationBlock = wrapper.get('[data-testid="event-type-duration"]');
    const input = durationBlock.get("input");
    expect(input.element.value).toBe("30");

    const buttons = durationBlock.findAll("button");
    const incrementButton = buttons[1];
    await incrementButton.trigger("click");
    await flushPromises();

    expect(input.element.value).toBe("40");
  });
});
