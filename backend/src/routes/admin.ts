import type { FastifyInstance } from "fastify";
import { validateOptionalTimestamp } from "../domain/validation.js";
import type { BookingService } from "../domain/bookingService.js";

export async function registerAdminRoutes(app: FastifyInstance, service: BookingService, serveFrontendApp = false) {
  app.get("/admin/event-types", async (request, reply) => {
    if (serveFrontendApp && acceptsHtml(request.headers.accept)) {
      return reply.sendFile("index.html");
    }

    return service.listEventTypes();
  });

  app.post("/admin/event-types", async (request, reply) => {
    const created = service.createEventType(request.body);
    return reply.code(201).send(created);
  });

  app.get("/admin/bookings", async (request, reply) => {
    if (serveFrontendApp && acceptsHtml(request.headers.accept)) {
      return reply.sendFile("index.html");
    }

    const query = request.query as { from?: string };
    const from = validateOptionalTimestamp(query.from, "from");
    return service.listUpcomingBookings(from);
  });
}

function acceptsHtml(acceptHeader: string | undefined) {
  return acceptHeader?.includes("text/html") ?? false;
}
