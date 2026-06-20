import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "./domain/errors.js";
import { BookingService, type BookingServiceOptions } from "./domain/bookingService.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerPublicRoutes } from "./routes/public.js";
import { MemoryStore } from "./store/memoryStore.js";

export interface BuildAppOptions {
  now?: BookingServiceOptions["now"];
  store?: MemoryStore;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify();
  const store = options.store ?? new MemoryStore();
  const service = new BookingService({ store, now: options.now });
  const frontendDistDir = getFrontendDistDir();
  const hasFrontendDist = existsSync(frontendDistDir);

  await app.register(cors, {
    origin: true,
  });

  if (hasFrontendDist) {
    await app.register(fastifyStatic, {
      root: frontendDistDir,
      prefix: "/",
    });
  }

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send(error.toResponse());
    }

    request.log.error?.(error);
    return reply.code(500).send({
      statusCode: 500,
      code: "unknown_error",
      message: "Internal Server Error",
    });
  });

  await registerAdminRoutes(app, service, hasFrontendDist);
  await registerPublicRoutes(app, service);

  app.get("/healthz", async () => ({ status: "ok" }));

  if (hasFrontendDist) {
    app.get("/", async (_request, reply) => reply.sendFile("index.html"));
    app.get("/booking", async (_request, reply) => reply.sendFile("index.html"));
  }

  return app;
}

function getFrontendDistDir() {
  const currentDir = dirname(fileURLToPath(import.meta.url));

  return resolve(currentDir, "../../frontend/dist");
}
