import { buildApp } from "./app.js";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);
const fixedNow = parseNow(process.env.NOW);

const app = await buildApp({
  now: fixedNow ? () => new Date(fixedNow) : undefined,
});

try {
  await app.listen({ host, port });
  console.log(`Backend listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

function parseNow(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid NOW value: ${value}`);
  }

  return parsed;
}
