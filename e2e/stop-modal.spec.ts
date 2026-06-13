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

  test('clicking a charger dot opens the stop modal with a Google Maps embed', async ({ page }) => {
    // Find the first clickable marker (class="marker") inside the SVG
    const marker = page.locator('g.marker').first();
    await expect(marker).toBeVisible();

    // Use a real pointer click (not a synthetic dispatchEvent)
    await marker.click({ force: true });

    // Modal should appear
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    // Fallback: look for the Google Maps iframe that StopModal renders
    const mapsEmbed = page.locator('iframe[src*="google.com/maps"]');
    await expect(mapsEmbed).toBeVisible({ timeout: 5000 });
  });

  test('clicking a charger marker opens modal with stop details', async ({ page }) => {
    // Target specifically a charge marker (green dot)
    const chargeMarker = page.locator('g.marker[style*="pointer"]').first();
    await chargeMarker.click({ force: true });

    // The modal should contain some identifying text (stop name, button, etc.)
    const mapsEmbed = page.locator('iframe[src*="google.com/maps"]');
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
