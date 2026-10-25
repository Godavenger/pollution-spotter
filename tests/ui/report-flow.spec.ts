import { expect, test, type Page, type Route } from "@playwright/test";
import type { PublicReport } from "../../lib/contracts";

// A tiny valid PNG is enough to exercise browser decoding and the multipart flow.
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
const photo = { name: "water-observation.png", mimeType: "image/png", buffer: png };
const realReport: PublicReport = {
  id: "a1111111-1111-4111-8111-111111111111",
  published_at: "2026-10-25T06:00:00.000Z",
  latitude: 22.5726,
  longitude: 88.3639,
  labels: ["garbage"],
  evidence: "Reviewed test observation: bottles beside the bank.",
  analysis_source: "manual_fallback",
  is_demo: false,
};
const sampleReport: PublicReport = {
  ...realReport,
  id: "a2222222-2222-4222-8222-222222222222",
  evidence: "Server sample: discarded wrappers beside water.",
  analysis_source: "mock",
  is_demo: true,
};
const browserErrors = new WeakMap<Page, string[]>();

function gate() {
  let release: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function enterPhotoAndLocation(page: Page) {
  await page.locator("#photo").setInputFiles(photo);
  await expect(page.getByAltText("Your selected water observation")).toBeVisible();
  await expect.poll(() => page.getByAltText("Your selected water observation").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByLabel("Latitude", { exact: true }).fill("22.5726");
  await page.getByLabel("Longitude", { exact: true }).fill("88.3639");
}

async function mockConfiguredSession(page: Page) {
  const now = Math.floor(Date.now() / 1000);
  const userId = "b1111111-1111-4111-8111-111111111111";
  const encoded = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encoded({ alg: "HS256", typ: "JWT" })}.${encoded({ sub: userId, aud: "authenticated", role: "authenticated", iat: now, exp: now + 3600 })}.test-signature`;
  let signIns = 0;
  await page.route("**/api/status", (route) => json(route, { configured: true, visionMode: "manual" }));
  await page.route("http://127.0.0.1:54321/public/auth/v1/signup", async (route) => {
    signIns += 1;
    await json(route, {
      access_token: token,
      refresh_token: "test-refresh-token",
      expires_in: 3600,
      expires_at: now + 3600,
      token_type: "bearer",
      user: {
        id: userId, aud: "authenticated", role: "authenticated", is_anonymous: true,
        app_metadata: { provider: "anonymous", providers: ["anonymous"] },
        user_metadata: {}, created_at: new Date().toISOString(),
      },
    });
  });
  return { token, signIns: () => signIns };
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrated|server rendered HTML|Minified React error/i.test(message.text())) {
      errors.push(message.text().split("\n")[0]);
    }
  });
  // No test may contact real Supabase, Gemini, or a tile service. Application API
  // requests remain local; configured journeys explicitly stub auth and reports.
  await page.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === "http://127.0.0.1:3001") await route.continue();
    else await route.abort();
  });
  await page.route("https://tile.openstreetmap.org/**", (route) => route.fulfill({ contentType: "image/png", body: png }));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? [], "The UI must not throw or hydrate with mismatched markup.").toEqual([]);
});

test("a phone preview validates inputs and never saves or publishes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/reports") && request.method() !== "GET") writes.push(request.method());
  });
  await page.goto("/");
  const previewButton = page.getByRole("button", { name: "Try a local preview" });
  await expect(previewButton).toBeEnabled();
  await previewButton.click();
  await expect(page.getByText("Choose a supported photo before continuing.")).toBeVisible();
  await page.locator("#photo").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("not an image") });
  await expect(page.getByText("Choose a JPEG, PNG, or WebP photo.")).toBeVisible();
  await page.locator("#photo").setInputFiles({ ...photo, buffer: Buffer.alloc(3 * 1024 * 1024 + 1) });
  await expect(page.getByText("This photo is larger than 3 MB. Choose a smaller photo.")).toBeVisible();
  await enterPhotoAndLocation(page);
  await page.getByLabel("Latitude", { exact: true }).fill("91");
  await previewButton.click();
  await expect(page.getByText(/Enter a valid latitude/)).toBeVisible();
  await page.getByLabel("Latitude", { exact: true }).fill("22.5726");
  await previewButton.click();
  await expect(page.getByRole("heading", { name: "Check what you can see" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Check what you can see" })).toBeFocused();
  await expect(page.getByText("Local preview · not saved or published")).toBeVisible();
  await page.getByLabel("Visible litter", { exact: true }).check();
  await expect(page.getByLabel("Unclear", { exact: true })).not.toBeChecked();
  await page.locator("#evidence").fill("Bottles are visible beside the water.");
  await page.getByRole("checkbox", { name: /I checked the labels/ }).check();
  await expect(page.getByRole("button", { name: "Publish to sample map" })).toBeDisabled();
  expect(writes).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Start a new observation" }).click();
  await expect(page.getByRole("heading", { name: "Make an observation", exact: true })).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Make an observation", exact: true })).toBeVisible();
  await expect(page.getByAltText("Photo to review before publication")).toHaveCount(0);
  expect(writes).toEqual([]);
});

test("503 is shown as unavailable, and a failed refresh retains known reports", async ({ page }) => {
  await page.goto("/map");
  await expect(page.getByRole("heading", { name: "Report list unavailable" })).toBeVisible();
  await expect(page.getByText("Public reports are unavailable right now.")).toBeVisible();
  await expect(page.getByText("No public observations yet.")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "0 published reports" })).toHaveCount(0);

  let unavailable = false;
  await page.route("**/api/reports", (route) => unavailable
    ? json(route, { error: "Temporary failure" }, 503)
    : json(route, { reports: [realReport] }));
  await page.getByRole("button", { name: "Refresh reports" }).click();
  await expect(page.getByRole("heading", { name: "1 published report", exact: true })).toBeVisible();
  unavailable = true;
  await page.getByRole("button", { name: "Refresh reports" }).click();
  await expect(page.getByText(/Previously loaded reports are still shown/)).toBeVisible();
  await expect(page.getByRole("list", { name: "published report with coordinates" })).toContainText(realReport.evidence);
  await expect(page.getByRole("heading", { name: "1 published report", exact: true })).toBeVisible();
});

test("switching report views ignores a late response and filters cross-view records", async ({ page }) => {
  const initialStarted = gate();
  const releaseInitial = gate();
  const initialFinished = gate();
  let realRequests = 0;
  await page.route("**/api/reports**", async (route) => {
    const samples = new URL(route.request().url()).searchParams.get("samples") === "true";
    if (!samples && ++realRequests === 1) {
      initialStarted.release();
      await releaseInitial.promise;
      try { await json(route, { reports: [realReport] }); }
      catch { /* View switching deliberately aborts the old fetch. */ }
      finally { initialFinished.release(); }
      return;
    }
    await json(route, { reports: [realReport, sampleReport] });
  });
  await page.goto("/map", { waitUntil: "domcontentloaded" });
  await initialStarted.promise;
  await page.getByRole("button", { name: "Samples", exact: true }).click();
  await expect(page.getByRole("heading", { name: "4 sample reports" })).toBeVisible();
  const sampleList = page.getByRole("list", { name: "sample reports with coordinates" });
  await expect(sampleList).toContainText(sampleReport.evidence);
  await expect(sampleList).not.toContainText(realReport.evidence);
  releaseInitial.release();
  await initialFinished.promise;
  await expect(sampleList).not.toContainText(realReport.evidence);
  await expect(page.getByRole("button", { name: "Samples", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Public reports", exact: true }).click();
  await expect(page.getByRole("heading", { name: "1 published report", exact: true })).toBeVisible();
  const realList = page.getByRole("list", { name: "published report with coordinates" });
  await expect(realList).toContainText(realReport.evidence);
  await expect(realList).not.toContainText(sampleReport.evidence);
  await expect(realList).not.toContainText("Fictional example");
});

test("a denied clipboard copy leaves the edited sample complaint selected", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException("Permission denied", "NotAllowedError")) },
    });
  });
  await page.goto("/map");
  await page.getByRole("button", { name: "Samples", exact: true }).click();
  await expect(page.getByText("Sample reports are fictional examples, not observations of these locations.")).toBeVisible();
  const selectedRow = page.getByRole("list", { name: "sample reports with coordinates" }).getByRole("button").first();
  await selectedRow.click();
  const editor = page.getByRole("region", { name: "Sample report", exact: true });
  await expect(editor.getByRole("heading", { name: "Sample report", exact: true })).toBeFocused();
  await expect(editor.getByText("This sample complaint is for demonstration only.")).toBeVisible();
  const message = editor.getByLabel("Edit your message");
  await expect(message).toHaveValue(/^SAMPLE ONLY/);
  const revised = "SAMPLE ONLY — edited demonstration.\nPlease inspect the described location.";
  await message.fill(revised);
  await editor.getByRole("button", { name: "Copy complaint" }).click();
  await expect(editor.getByText(/Copy was unavailable. Your text is selected/)).toBeVisible();
  await expect(message).toBeFocused();
  expect(await message.evaluate((element) => {
    const input = element as HTMLTextAreaElement;
    return { start: input.selectionStart, end: input.selectionEnd, value: input.value };
  })).toEqual({ start: 0, end: revised.length, value: revised });
  await message.fill(`${revised}\nFurther edits remain possible.`);
  await expect(editor.getByText("Edits stay on this page.")).toBeVisible();
  await editor.getByRole("button", { name: "Close report details" }).click();
  await expect(editor).toHaveCount(0);
  await expect(selectedRow).toBeFocused();
});

test("configured review recovers from save and publish failures without inventing success", async ({ page }) => {
  const session = await mockConfiguredSession(page);
  const createStarted = gate();
  const releaseCreate = gate();
  let creates = 0;
  let published: PublicReport | null = null;
  const publishBodies: unknown[] = [];
  const authorizations: (string | undefined)[] = [];

  await page.route("**/api/reports**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await json(route, { reports: published ? [published] : [] });
    } else if (request.method() === "POST") {
      creates += 1;
      authorizations.push(request.headers().authorization);
      if (creates === 1) {
        await json(route, { error: "Your photo could not be saved. Please try again." }, 503);
      } else {
        expect(request.headers()["content-type"]).toMatch(/^multipart\/form-data;/);
        expect(request.postDataBuffer()?.toString()).toContain('name="image"; filename="water-observation.png"');
        createStarted.release();
        await releaseCreate.promise;
        await json(route, { report: {
          id: realReport.id, latitude: realReport.latitude, longitude: realReport.longitude,
          labels: ["unclear"], evidence: "No automated visual assessment is available. Review this photo manually.",
          analysis_source: "manual_fallback", is_demo: false, status: "needs_review",
        } }, 201);
      }
    } else if (request.method() === "PATCH") {
      expect(new URL(request.url()).pathname).toBe(`/api/reports/${realReport.id}`);
      authorizations.push(request.headers().authorization);
      const body = request.postDataJSON();
      publishBodies.push(body);
      if (publishBodies.length === 1) {
        await json(route, { error: "Publication could not be confirmed. Try publishing again to check this report." }, 503);
      } else {
        published = { ...realReport, labels: body.labels, evidence: body.evidence, latitude: body.latitude, longitude: body.longitude };
        await json(route, { report: published });
      }
    } else await route.abort();
  });

  await page.goto("/");
  await enterPhotoAndLocation(page);
  const save = page.getByRole("button", { name: "Save & review" });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText("Your photo could not be saved. Please try again.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Check what you can see" })).toHaveCount(0);
  expect(creates).toBe(1);
  await save.click();
  await createStarted.promise;
  await expect(page.getByRole("button", { name: "Saving and preparing review…" })).toBeDisabled();
  releaseCreate.release();
  await expect(page.getByRole("heading", { name: "Check what you can see" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Check what you can see" })).toBeFocused();
  await expect(page.getByText("No AI assessment is available. Your own observation is enough to continue.")).toBeVisible();
  await expect(page.locator("#evidence")).toHaveValue("");
  const publish = page.getByRole("button", { name: "Publish observation", exact: true });
  const confirmation = page.getByRole("checkbox", { name: /I checked the labels/ });
  await expect(publish).toBeDisabled();
  await page.getByLabel("Visible litter", { exact: true }).check();
  await page.locator("#evidence").fill(realReport.evidence);
  await confirmation.check();
  await expect(publish).toBeEnabled();
  await page.getByLabel("Latitude", { exact: true }).fill("22.5727");
  await expect(confirmation).not.toBeChecked();
  await expect(publish).toBeDisabled();
  await confirmation.check();
  await publish.click();
  await expect(page.getByText(/Publication could not be confirmed/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your observation is on the map" })).toHaveCount(0);
  await expect(page.locator("#evidence")).toHaveValue(realReport.evidence);
  await publish.click();
  await expect(page.getByRole("heading", { name: "Your observation is on the map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your observation is on the map" })).toBeFocused();
  await expect(page.getByRole("list", { name: "published report with coordinates" })).toContainText(realReport.evidence);
  await expect(page.getByLabel("Edit your message")).toHaveValue(new RegExp(realReport.id));
  expect(creates).toBe(2); // One explicit retry of the failed save; no automatic retry.
  expect(publishBodies).toHaveLength(2);
  expect(publishBodies[1]).toEqual(publishBodies[0]);
  expect(publishBodies[0]).toMatchObject({ action: "publish", reviewed: true, labels: ["garbage"], latitude: 22.5727 });
  expect(session.signIns()).toBe(1);
  expect(authorizations.every((header) => header === `Bearer ${session.token}`)).toBe(true);
});

test("reduced-motion maps and long observations remain usable on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const longReport = { ...realReport, evidence: "W".repeat(240), labels: ["garbage", "algal_bloom", "oil_sheen"] };
  await page.route("**/api/reports**", (route) => json(route, { reports: [longReport] }));
  await page.goto("/map");
  const map = page.locator(".spotter-map");
  await expect(map).toBeVisible();
  await expect(map).not.toHaveClass(/leaflet-fade-anim/);
  await expect(page.locator(".spotter-map-pin")).toHaveCount(1);
  await expect(page.locator(".spotter-map-pin")).not.toHaveClass(/leaflet-zoom-animated/);
  const row = page.getByRole("list", { name: "published report with coordinates" }).getByRole("button");
  await expect(row).toContainText(longReport.evidence);
  expect(await row.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await row.click();
  const detail = page.getByRole("region", { name: "Reviewed report", exact: true });
  await expect(detail.getByRole("heading", { name: "Reviewed report", exact: true })).toBeFocused();
  await expect(detail).toContainText(longReport.evidence);
  expect(await detail.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await detail.getByRole("button", { name: "Close report details" }).click();
  await expect(row).toBeFocused();

  const samples = page.getByRole("button", { name: "Samples", exact: true });
  await samples.click();
  expect(await page.getByRole("group", { name: "Report view" }).evaluate((element) => getComputedStyle(element, "::before").transitionDuration)).toBe("0s");
  await expect(page.getByRole("list", { name: "sample reports with coordinates" })).not.toContainText(longReport.evidence);
});

test("keyboard navigation and report-view changes keep immediate focus feedback", async ({ page }) => {
  await page.goto("/");
  const mapLink = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Community map" });
  await mapLink.focus();
  await mapLink.press("Enter");
  await expect(page).toHaveURL(/\/map$/);
  await expect(mapLink).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("data-input", "keyboard");
  const samples = page.getByRole("button", { name: "Samples", exact: true });
  await samples.focus();
  await samples.press("Enter");
  await expect(samples).toBeFocused();
  await expect(samples).toHaveAttribute("aria-pressed", "true");
  expect(await page.getByRole("group", { name: "Report view" }).evaluate((element) => getComputedStyle(element, "::before").transitionDuration)).toBe("0s");
  const row = page.getByRole("list", { name: "sample reports with coordinates" }).getByRole("button").first();
  await row.focus();
  await row.press("Enter");
  const detail = page.getByRole("region", { name: "Sample report", exact: true });
  await expect(detail.getByRole("heading", { name: "Sample report", exact: true })).toBeFocused();
  await detail.getByRole("button", { name: "Close report details" }).press("Enter");
  await expect(row).toBeFocused();
});
