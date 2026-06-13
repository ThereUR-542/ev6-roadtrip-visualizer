import { test, expect } from '@playwright/test';

/**
 * Real-browser regression test for FR-9: clicking a stop marker opens the modal.
 * This test performs genuine pointer events (not synthetic jsdom clicks) so it
 * catches the class of bug that the jsdom smoke test cannot — e.g. pointer-event
 * handling in JourneyMap swallowing clicks before they reach the onClick handler.
 */

test.describe('FR-9 stop modals — real pointer clicks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the map to render
    await page.waitForSelector('[aria-label="US route map"]', { timeout: 10000 });
  });

  // Realistic click helper: hover the dot (lets :hover styles apply), pause a
  // frame, then press and release WITHOUT force. This reproduces a real user and
  // is what exposes the hover-teleport class of bug. A `force:true` center click
  // skips the hover frame and hides exactly this failure — do NOT use it here.
  async function realClick(page, locator) {
    const box = await locator.boundingBox();
    if (!box) throw new Error('marker has no bounding box');
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx - 2, cy - 2);
    await page.mouse.move(cx, cy); // settle on the dot so :hover applies
    await page.waitForTimeout(80); // let the hover transition run a frame
    await page.mouse.down();
    await page.mouse.up();
  }

  test('clicking a charger dot opens the stop modal with a Google Maps embed', async ({ page }) => {
    // Find the first clickable marker (class="marker") inside the SVG
    const marker = page.locator('g.marker').first();
    await expect(marker).toBeVisible();

    // Realistic hover-then-click (NOT force) — the dot must stay under the cursor.
    await realClick(page, marker);

    // Fallback: look for the Google Maps iframe that StopModal renders
    // Scope to the map embed only (output=embed); the modal also renders a
    // separate Street View iframe (output=svembed), so the bare "google.com/maps"
    // match would be ambiguous under Playwright strict mode.
    const mapsEmbed = page.locator('iframe[src*="output=embed"]');
    await expect(mapsEmbed).toBeVisible({ timeout: 5000 });

    // FIX-1 (FR-9): the modal must embed a real, keyless Google Street View
    // panorama of the location — not just a link-out (no API key, OQ-3).
    const streetView = page.locator('iframe[src*="output=svembed"]');
    await expect(streetView).toBeVisible({ timeout: 5000 });
    await expect(streetView).toHaveAttribute('src', /cbll=-?\d+\.\d+,-?\d+\.\d+/);
  });

  test('every clickable stop dot opens the modal with a real hover-then-click', async ({ page }) => {
    const markers = page.locator('g.marker');
    const n = await markers.count();
    expect(n).toBeGreaterThan(0);
    // Scope to the map embed only (output=embed); the modal also renders a
    // separate Street View iframe (output=svembed), so the bare "google.com/maps"
    // match would be ambiguous under Playwright strict mode.
    const mapsEmbed = page.locator('iframe[src*="output=embed"]');
    for (let i = 0; i < n; i++) {
      await realClick(page, markers.nth(i));
      await expect(mapsEmbed, `dot #${i} should open a modal`).toBeVisible({ timeout: 5000 });
      await page.keyboard.press('Escape');
      await expect(mapsEmbed).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('clicking a charger marker opens modal with stop details', async ({ page }) => {
    // Target specifically a charge marker (green dot)
    const chargeMarker = page.locator('g.marker[style*="pointer"]').first();
    await realClick(page, chargeMarker);

    // The modal should contain some identifying text (stop name, button, etc.)
    // Scope to the map embed only (output=embed); the modal also renders a
    // separate Street View iframe (output=svembed), so the bare "google.com/maps"
    // match would be ambiguous under Playwright strict mode.
    const mapsEmbed = page.locator('iframe[src*="output=embed"]');
    await expect(mapsEmbed).toBeVisible({ timeout: 5000 });

    // Escape closes the modal
    await page.keyboard.press('Escape');
    await expect(mapsEmbed).not.toBeVisible({ timeout: 2000 });
  });

  test('zoom controls render with visible + and - glyphs', async ({ page }) => {
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    const zoomOut = page.locator('button[aria-label="Zoom out"]');
    const reset = page.locator('button[aria-label="Reset view"]');

    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    await expect(reset).toBeVisible();

    // Verify the button text contains recognizable glyphs (not empty / invisible fullwidth)
    await expect(zoomIn).toHaveText('+');
    // minus sign (HTML entity &minus; = U+2212)
    const zoomOutText = await zoomOut.textContent();
    expect(zoomOutText?.trim()).toBeTruthy();

    // Clicking zoom in should not throw
    await zoomIn.click();
    await zoomOut.click();
    await reset.click();
  });
});
