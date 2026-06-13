// @vitest-environment jsdom
/**
 * Render smoke test (PLE-47) — the CI gate that was missing.
 *
 * Background: PLE-46 reported a "blank shell" on the live site. The deployed
 * bundle is byte-identical to a local `vite build` and renders the full app in
 * a real browser (verified in Chromium, both locally and on the live URL), so
 * there was never an actual render crash — the "blank #root" was the static,
 * pre-hydration HTML that any client-rendered SPA serves (what view-source /
 * curl show), not the executed DOM.
 *
 * The real gap this exposed: the suite was node-only and never mounted a single
 * React component, so a genuine render crash COULD have shipped green. These
 * tests close that gap — they mount the real <App/> in jsdom and assert the
 * board's checklist items actually render, so any future blank-shell regression
 * fails CI instead of shipping.
 */
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

describe('App render smoke (anti blank-shell)', () => {
  test('mounts without throwing and fills #root with real content', () => {
    const { container } = render(<App />);
    expect(container.firstChild).not.toBeNull();
    // A blank shell would have ~0 nodes; the real app renders hundreds.
    expect(container.querySelectorAll('*').length).toBeGreaterThan(50);
  });

  // Checklist 1: horizontal journey with route line.
  test('EV6 default view shows the journey map with a route line', () => {
    const { container } = render(<App />);
    const map = container.querySelector('svg[aria-label="US route map"]');
    expect(map).not.toBeNull();
    // Route spine is drawn as <path> elements inside the map svg.
    expect(map!.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/Journey/i);
  });

  // Checklist 5: 20–80% charging labels in EV6 view.
  test('EV6 view shows 20–80% charging labels', () => {
    const { container } = render(<App />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/charg/i);
    expect(text).toMatch(/20.{0,3}80%/); // "20→80%" / "20-80%"
  });

  // Checklist 2 + 4: vehicle toggle actually switches EV6 ↔ Sportage, and the
  // Sportage view surfaces coffee shops.
  test('vehicle toggle switches EV6 → Sportage and reveals coffee shops', () => {
    const { container } = render(<App />);

    // EV6 default: charging strategy present, no coffee-only panel.
    expect(container.textContent).toMatch(/charging strategy/i);

    fireEvent.click(screen.getByRole('tab', { name: /Sportage Hybrid/i }));

    const text = container.textContent ?? '';
    expect(text).toMatch(/coffee/i); // Sportage = coffee-only stops
    expect(text).toMatch(/Coffee stops/i);
    // EV6-only charging strategy section should be gone after the switch.
    expect(text).not.toMatch(/the 20.{0,3}80% rule/i);

    // Toggle back to EV6 restores the charging view.
    fireEvent.click(screen.getByRole('tab', { name: /^EV6/i }));
    expect(container.textContent).toMatch(/charging strategy/i);
  });

  // Checklist 3: clicking a stop opens a glassmorphic modal with a Google Maps embed.
  test('clicking a stop opens a modal with a Google Maps embed', () => {
    const { container } = render(<App />);

    // Map markers for chargers/coffee/hotels are clickable <g class="marker">.
    const marker = container.querySelector('g.marker');
    expect(marker).not.toBeNull();
    fireEvent.click(marker!);

    const dialog = screen.getByRole('dialog');
    const iframe = within(dialog).getByTitle(/^Map of /i) as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toMatch(/google\.com\/maps/);
    expect(iframe.getAttribute('src')).toMatch(/output=embed/);
  });
});
