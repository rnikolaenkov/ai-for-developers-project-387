import { defineConfig } from "@playwright/test";

const backendPort = 3100;
const frontendPort = 4173;
const fixedNow = "2026-06-20T08:00:00.000Z";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    headless: true,
    locale: "ru-RU",
    timezoneId: "UTC",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run start:test",
      cwd: "../backend",
      env: {
        HOST: "127.0.0.1",
        NOW: fixedNow,
        PORT: String(backendPort),
      },
      port: backendPort,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
      cwd: ".",
      env: {
        VITE_API_BASE_URL: `http://127.0.0.1:${backendPort}`,
      },
      port: frontendPort,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
