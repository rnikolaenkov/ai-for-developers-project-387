import type { FastifyInstance } from "fastify";
import { validateOptionalDays, validateOptionalTimestamp } from "../domain/validation.js";
import type { BookingService } from "../domain/bookingService.js";

export async function registerPublicRoutes(app: FastifyInstance, service: BookingService) {
  app.get("/event-types", async () => service.listPublicEventTypes());

  app.get("/event-types/:eventTypeId/availability", async (request) => {
    const params = request.params as { eventTypeId: string };
    const query = request.query as { from?: string; days?: string };
    const from = validateOptionalTimestamp(query.from, "from");
    const days = validateOptionalDays(query.days);

    return service.getAvailability(params.eventTypeId, from, days);
  });

  app.post("/bookings", async (request, reply) => {
    const created = service.createBooking(request.body);
    return reply.code(201).send(created);
  });
}
