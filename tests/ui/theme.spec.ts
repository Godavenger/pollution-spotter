import { expect, test, type Locator, type Page } from "@playwright/test";

const STORAGE_KEY = "pollution-spotter-theme";
const LIGHT = "#f6f8f6";
const DARK = "#101312";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
const browserErrors = new WeakMap<Page, string[]>();

async function expectTheme(page: Page, theme: "light" | "dark") {
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.getByRole("button", { name: "Toggle dark mode", exact: true })).toHaveAttribute("aria-pressed", String(theme === "dark"));
  await expect.poll(() => page.locator('meta[name="theme-color"]').evaluateAll((metas) => metas.map((meta) => meta.getAttribute("content"))))
    .toEqual([theme === "dark" ? DARK : LIGHT, theme === "dark" ? DARK : LIGHT]);
}

async function expectNoToggleMotion(toggle: Locator) {
  const runningDurations = await toggle.evaluate((element) => element.getAnimations({ subtree: true })
    .filter((animation) => animation.playState === "running")
    .map((animation) => animation.effect?.getTiming().duration ?? 0)
    .filter((duration) => duration !== 0));
  expect(runningDurations, "Reduced-motion and keyboard theme changes must not run icon movement.").toEqual([]);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrated|server rendered HTML|did not match|Minified React error/i.test(message.text())) errors.push(message.text().split("\n")[0]);
  });
  // Theme checks use local previews and fixtures; never contact live services.
  await page.route("**/*", (route) => new URL(route.request().url()).origin === "http://127.0.0.1:3001" ? route.continue() : route.abort());
  await page.route("https://tile.openstreetmap.org/**", (route) => route.fulfill({ contentType: "image/png", body: png }));
  await page.route("**/api/status", (route) => route.fulfill({ json: { configured: false, visionMode: "manual" } }));
  await page.route("**/api/reports**", (route) => route.fulfill({ json: { reports: [] } }));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? [], "Theme rendering must not cause runtime or hydration errors.").toEqual([]);
});

test("theme follows the OS until selected, then persists across routes and reloads", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expectTheme(page, "dark");
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();

  await page.emulateMedia({ colorScheme: "light" });
  await expectTheme(page, "light");
  const toggle = page.getByRole("button", { name: "Toggle dark mode", exact: true });
  await toggle.click();
  await expectTheme(page, "dark");
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe("dark");

  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expectTheme(page, "dark");
  await page.getByRole("link", { name: "Community map", exact: true }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expectTheme(page, "dark");
  await page.reload();
  await expectTheme(page, "dark");

  await toggle.click();
  await expectTheme(page, "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectTheme(page, "light");
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe("light");
});

test("changing the theme preserves an in-progress photo review and never submits it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light" });
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/reports") && request.method() !== "GET") writes.push(request.method());
  });
  await page.goto("/");
  await page.locator("#photo").setInputFiles({ name: "water-observation.png", mimeType: "image/png", buffer: png });
  await expect(page.getByAltText("Your selected water observation")).toBeVisible();
  await page.getByLabel("Latitude", { exact: true }).fill("-33.8688");
  await page.getByLabel("Longitude", { exact: true }).fill("151.2093");
  await page.getByRole("button", { name: "Try a local preview" }).click();
  await expect(page.getByRole("heading", { name: "Check what you can see" })).toBeVisible();
  await page.getByLabel("Visible litter", { exact: true }).check();
  const description = "পুকুরের ধারে প্লাস্টিকের বোতল দেখা যাচ্ছে।";
  await page.locator("#evidence").fill(description);
  const confirmed = page.getByRole("checkbox", { name: /I checked the labels/ });
  await confirmed.check();
  const image = page.getByAltText("Photo to review before publication");
  const imageSource = await image.getAttribute("src");

  await page.getByRole("button", { name: "Toggle dark mode", exact: true }).click();
  await expectTheme(page, "dark");
  await expect(page.locator("#evidence")).toHaveValue(description);
  await expect(page.getByLabel("Visible litter", { exact: true })).toBeChecked();
  await expect(confirmed).toBeChecked();
  await expect(page.getByLabel("Latitude", { exact: true })).toHaveValue("-33.8688");
  await expect(page.getByLabel("Longitude", { exact: true })).toHaveValue("151.2093");
  await expect(image).toHaveAttribute("src", imageSource!);
  await expect(page.getByRole("button", { name: "Publish to sample map" })).toBeDisabled();
  expect(writes).toEqual([]);
});

test("the phone toggle stays keyboard accessible and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await expectTheme(page, "light");
  const toggle = page.getByRole("button", { name: "Toggle dark mode", exact: true });
  const bounds = await toggle.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  expect(bounds?.height).toBeGreaterThanOrEqual(44);
  await toggle.focus();
  await toggle.press("Space");
  await expectTheme(page, "dark");
  await expect(toggle).toBeFocused();
  await expectNoToggleMotion(toggle);
  expect(await toggle.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");

  // Pointer input still respects the OS reduced-motion preference.
  await toggle.click();
  await expectTheme(page, "light");
  await expectNoToggleMotion(toggle);

  // Keyboard input is quiet even when OS motion is enabled.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await toggle.focus();
  await toggle.press("Enter");
  await expectTheme(page, "dark");
  await expect(toggle).toBeFocused();
  await expectNoToggleMotion(toggle);
});
