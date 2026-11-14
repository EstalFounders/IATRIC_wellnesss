import { expect, test } from '@playwright/test';
import {
  assertNoCrash,
  clickTarget,
  closeExtraTabs,
  collectClickTargets,
  collectInternalLinks,
  expectNoIssues,
  installWriteGuard,
  openPage,
  pathnameOf,
  printReport,
  restorePage,
  settleAfterClick,
  shouldSkipClick,
  SiteMonitor,
  withTimeout,
  type CrawlReport,
} from './helpers/site-crawler';

/**
 * Site crawler: visits every page reachable from `/`, clicks every primary
 * control on each one, and fails on the first runtime error.
 *
 * Run it with:
 *   npm run test:crawl          (or: npx playwright test tests/e2e/site-crawler.spec.ts
 *                                --project="Desktop Chrome")
 *
 * Knobs (all optional):
 *   CRAWL_MAX_PAGES    [25]      page budget for one run
 *   CRAWL_MAX_DEPTH    [3]       link depth from the seeds
 *   CRAWL_MAX_CLICKS   [6]       controls clicked per page
 *   CRAWL_SETTLE_MS    [600]     wait after each click before checking for errors
 *   CRAWL_SEEDS        [/]       entry points (default: /, /appointment, /payment/thankyou)
 *   CRAWL_STRICT_API   [0]       1 = also fail on the tolerated API 4xx/5xx
 *   CRAWL_ALL_PROJECTS [0]       1 = run on all 9 device projects (slow)
 *   CRAWL_DEBUG        [0]       1 = log every discovered control and its outcome
 *   CRAWL_DOM_TIMEOUT_MS [15000] a frozen main thread is reported after this
 *   CRAWL_PAGE_TIMEOUT_MS [360000] one page (load + clicks) may take this long
 *   CRAWL_TIMEOUT_MS   [1200000] hard test timeout
 *
 * What counts as a failure: uncaught exceptions (`pageerror`), any
 * `console.error`, an HTTP error on the page document (a dead internal link),
 * Next's dev overlay, and the ErrorBoundary / `_error` fallback becoming visible.
 * Asset 404s (the missing "TT Ramillas" webfonts), React deprecation warnings and
 * API calls that legitimately fail without a real id are warnings only - see the
 * allowlists in `tests/e2e/helpers/site-crawler.ts`.
 */

const MAX_PAGES = Number(process.env.CRAWL_MAX_PAGES ?? 25);
const MAX_DEPTH = Number(process.env.CRAWL_MAX_DEPTH ?? 3);
const MAX_CLICKS = Number(process.env.CRAWL_MAX_CLICKS ?? 6);
const SETTLE_MS = Number(process.env.CRAWL_SETTLE_MS ?? 600);
const TIMEOUT_MS = Number(process.env.CRAWL_TIMEOUT_MS ?? 20 * 60_000);
/** How long one page may take (load + warm-up + its clicks) before it counts as wedged. */
const PAGE_TIMEOUT_MS = Number(process.env.CRAWL_PAGE_TIMEOUT_MS ?? 6 * 60_000);
const DEBUG = process.env.CRAWL_DEBUG === '1';

const debug = (message: string) => {
  if (DEBUG) console.log(`  · ${message}`);
};

/**
 * `/payment/thankyou` is seeded (it is part of the requirement) but not clicked:
 * it polls the payment status for ~36s and its only controls are "Try again" /
 * "Go to homepage".
 */
const SEEDS = (
  process.env.CRAWL_SEEDS ?? '/,/appointment,/payment/thankyou?appointmentId=e2e-crawler'
)
  .split(',')
  .map((seed) => seed.trim())
  .filter(Boolean);

/**
 * Routes the crawler stays out of. The panels need a signed-in doctor /
 * super-admin session (visiting them only bounces to a login page), the meeting
 * room needs a socket and a live consultation, and the dev preview needs a
 * session too.
 */
const ROUTE_EXCLUDES: RegExp[] = [
  /^\/api(\/|$)/,
  /^\/_next(\/|$)/,
  /^\/registerDoc(\/|$)/,
  /^\/superAdmin(\/|$)/,
  /^\/marketing(\/|$)/,
  /^\/meeting(\/|$)/,
  /^\/__dev/,
  /^\/_error$/,
  /^\/404$/,
];

/** Pages where a click could start something expensive or real. */
const NO_CLICK_ROUTES: RegExp[] = [/^\/payment(\/|$)/];

const isExcluded = (pathname: string) => ROUTE_EXCLUDES.some((pattern) => pattern.test(pathname));

test.describe('site crawler', () => {
  // One crawl per run is enough: it is a smoke test of the whole site, not a
  // per-device layout check. `CRAWL_ALL_PROJECTS=1` opts into the full matrix.
  test.beforeEach(() => {
    test.skip(
      process.env.CRAWL_ALL_PROJECTS !== '1' && test.info().project.name !== 'Desktop Chrome',
      'Crawler runs on "Desktop Chrome" only; set CRAWL_ALL_PROJECTS=1 to run it on every project.',
    );
    test.setTimeout(TIMEOUT_MS);
  });

  test('every page loads and every primary control works without runtime errors', async ({
    page,
    baseURL,
  }, testInfo) => {
    const origin = baseURL ?? 'http://localhost:3000';
    const monitor = new SiteMonitor(page).attach();
    await installWriteGuard(page, monitor);

    const report: CrawlReport = {
      baseURL: origin,
      visited: [],
      issues: [],
      warnings: [],
      blockedWrites: monitor.blockedWrites,
    };
    const clickLog: string[] = [];
    const skipLog: string[] = [];

    const queue = SEEDS.map((seed) => ({ path: seed, depth: 0 }));
    const seenPathnames = new Set<string>();
    /** Routes already requested once, so `next dev` has compiled their chunk. */
    const warmed = new Set<string>();

    /**
     * Everything one page costs: load, warm its targets, click its controls.
     *
     * Extracted so the caller can put a budget around it. A page whose main thread
     * wedges (an infinite render loop, a promise nobody settles) keeps every
     * Playwright call pending, including Playwright's own timeouts - which live in
     * the page. Without the race the crawl hangs instead of failing, and a hung
     * crawl reports nothing at all.
     *
     * The links are collected *before* the click phase because `next dev` compiles
     * a route on first request: a <Link> that is clicked (or prefetched) before its
     * chunk exists 404s it and the router logs "Failed to load script", a dev-only
     * race that says nothing about the control under test. One document request per
     * new route removes it - and they are visited anyway.
     */
    const crawlPage = async (path: string, pathname: string) => {
      // ---- 1. load the page ---------------------------------------------
      const response = await openPage(page, origin + path);
      await closeExtraTabs(page);
      await assertNoCrash(page, monitor, 'page load');

      // ---- 2. warm the routes this page links to -------------------------
      const links = await collectInternalLinks(page, origin).catch(() => []);
      if (DEBUG) console.log(`  · ${path}: ${links.length} internal link(s) discovered`);
      for (const link of links) {
        const linkedPathname = pathnameOf(link);
        if (warmed.has(linkedPathname) || isExcluded(linkedPathname)) continue;
        warmed.add(linkedPathname);
        await page.request
          .get(origin + link, { timeout: 90_000, failOnStatusCode: false })
          .catch(() => {});
      }

      // ---- 3. click every primary control -------------------------------
      let clicks = 0;
      let skipped = 0;

      if (!NO_CLICK_ROUTES.some((pattern) => pattern.test(pathname))) {
        const targets = await collectClickTargets(page, MAX_CLICKS * 2);
        if (DEBUG) console.log(`  · ${path}: ${targets.length} control(s) found`);

        for (const target of targets) {
          if (clicks >= MAX_CLICKS) break;

          if (shouldSkipClick(target)) {
            skipped += 1;
            skipLog.push(`${path} · ${target.label}`);
            debug(`skip (destructive/payment): ${target.label}`);
            continue;
          }

          const step = `click "${target.label}"`;
          monitor.setContext(path, step);

          const outcome = await clickTarget(page, target);
          debug(`${outcome}: ${target.label}`);
          if (outcome === 'missing') {
            // The page re-rendered between discovery and click - a race, not a
            // failure; that control is covered by the next discovery round.
            continue;
          }
          if (outcome === 'blocked') {
            skipLog.push(`${path} · ${target.label} (covered by an overlay)`);
            continue;
          }

          await settleAfterClick(page, SETTLE_MS);
          await closeExtraTabs(page);
          await assertNoCrash(page, monitor, step);
          clicks += 1;
          clickLog.push(`${path} · ${target.label}`);

          // Put the page back so the next control is clickable and the control
          // keys still point at the same elements.
          await restorePage(page, origin + path);
          await assertNoCrash(page, monitor, `after ${step}`);
          monitor.setContext(path, step);
        }
      }

      return { response, links, clicks, skipped };
    };

    while (queue.length && report.visited.length < MAX_PAGES) {
      const { path, depth } = queue.shift()!;
      const pathname = pathnameOf(path);
      if (seenPathnames.has(pathname)) continue;
      if (isExcluded(pathname)) continue;
      if (depth > MAX_DEPTH) continue;
      seenPathnames.add(pathname);

      monitor.setContext(path, 'load');
      const startedAt = Date.now();

      let pageResult: Awaited<ReturnType<typeof crawlPage>>;
      try {
        pageResult = await withTimeout(crawlPage(path, pathname), PAGE_TIMEOUT_MS, `crawling ${path}`);
      } catch (error) {
        // A wedged page must not swallow the rest of the report.
        report.warnings.push(...monitor.warnings);
        report.issues.push(...monitor.issues);
        printReport(report);
        throw error;
      }
      const { response, links, clicks, skipped } = pageResult;

      // ---- 4. enqueue the discovered routes -----------------------------
      if (depth < MAX_DEPTH) {
        for (const link of links) {
          const linkedPathname = pathnameOf(link);
          if (seenPathnames.has(linkedPathname) || isExcluded(linkedPathname)) continue;
          queue.push({ path: link, depth: depth + 1 });
        }
      }

      // ---- 5. record + fail fast ----------------------------------------
      report.visited.push({
        path,
        status: response?.status() ?? 0,
        clicks,
        skippedClicks: skipped,
        durationMs: Date.now() - startedAt,
      });

      const issuesHere = [...monitor.issues];
      report.warnings.push(...monitor.warnings);
      report.issues.push(...issuesHere);
      monitor.reset();

      console.log(
        `✔ ${path} (${clicks} clicked, ${skipped} skipped, ${issuesHere.length} issue(s))`,
      );

      if (issuesHere.length) {
        // Fail on this page immediately, with the stack traces: continuing would
        // only bury the first (and usually the only) real bug.
        printReport({ ...report, blockedWrites: monitor.blockedWrites });
        expectNoIssues(issuesHere);
      }

      monitor.setContext(path, 'next page');
    }

    printReport(report);

    await testInfo.attach('crawl-report.json', {
      body: JSON.stringify({ ...report, clicked: clickLog, skipped: skipLog }, null, 2),
      contentType: 'application/json',
    });

    // Final guards: something must have been crawled, and nothing may have been
    // reported after the last page (e.g. a late async rejection).
    expect(report.visited.length, 'the crawler did not visit any page').toBeGreaterThan(0);
    expectNoIssues(monitor.issues);
  });
});

