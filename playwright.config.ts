import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ui",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:3001",
    browserName: "chromium",
    channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined),
    viewport: { width: 1440, height: 1000 },
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321/public",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "e2e-public-key",
      SUPABASE_SERVICE_ROLE_KEY: "",
      VISION_MODE: "manual",
      GEMINI_API_KEY: "",
      GEMINI_MODEL: "",
    },
  },
});
