import { request } from '@playwright/test';

/**
 * Route warm-up (runs once, before any browser connects to the app).
 *
 * The app is served by the Next.js dev server, which compiles routes on demand and
 * broadcasts Fast Refresh updates that can force a full page reload. Such a reload
 * aborts an in-flight navigation (e.g. the sandbox checkout return to
 * /payment/thankyou), which made the appointment suite flaky. Requesting every route
 * touched by the suite up-front compiles them before the first browser is opened.
 */
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const ROUTES = ['/', '/appointment', '/payment/thankyou?appointmentId=e2e-warmup'];

export default async function globalSetup() {
  const context = await request.newContext({ baseURL: BASE_URL });

  for (const route of ROUTES) {
    const response = await context.get(route, { timeout: 240_000 });
    if (!response.ok()) {
      throw new Error(`Route warm-up failed for ${route}: HTTP ${response.status()}`);
    }
  }

  await context.dispose();
}
