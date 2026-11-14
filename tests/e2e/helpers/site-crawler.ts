import { expect, type ConsoleMessage, type Page, type Response } from '@playwright/test';

/**
 * Building blocks for the site crawler (`tests/e2e/site-crawler.spec.ts`).
 *
 * The crawler walks every page it can reach from `/`, clicks every primary
 * control on it and fails on the first sign of a runtime problem. Three things
 * in this app make that harder than a textbook crawler:
 *
 *   1. **Everything renders on the client.** `pages/_app.js` wraps the tree in
 *      <NoSsr> + <PersistGate>, so a route is blank until its bundle has loaded
 *      and redux-persist has rehydrated. Waiting for `load` is not enough; the
 *      helpers below wait for the boot overlay to disappear.
 *   2. **The pages have side effects.** Clicking through `/appointment` can send
 *      a real WhatsApp OTP, create an appointment and open a payment gateway.
 *      `installWriteGuard` blocks every non-GET `/api/**` call (and the payment
 *      SDK + analytics beacons), so a crawl never writes anything.
 *   3. **Dev-server noise is not a bug.** Missing webfonts answer 404, React
 *      prints deprecation warnings, and API calls fail for pages that need a
 *      real id. `SiteMonitor` separates that noise (warnings) from real
 *      JavaScript failures (issues) - see the allowlists below.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type CrawlIssueKind =
  | 'pageerror'
  | 'console-error'
  | 'http-error'
  | 'crash-ui'
  | 'click-failed';

export interface CrawlIssue {
  kind: CrawlIssueKind;
  /** Route the crawler was on. */
  page: string;
  /** What it was doing: "load", `click "Book Now"`, ... */
  step: string;
  detail: string;
  stack?: string;
}

export interface VisitedPage {
  path: string;
  status: number;
  clicks: number;
  skippedClicks: number;
  durationMs: number;
}

export interface CrawlReport {
  baseURL: string;
  visited: VisitedPage[];
  issues: CrawlIssue[];
  warnings: string[];
  blockedWrites: string[];
}

/* -------------------------------------------------------------------------- */
/* Allowlists                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Console errors that are not our code failing. Kept intentionally small: every
 * entry needs a reason, because this is the list that can hide a real bug.
 */
const IGNORED_CONSOLE_ERRORS: RegExp[] = [
  // Dev-only suggestion from the React DevTools extension hook.
  /Download the React DevTools/,
  // react-bootstrap 1.6 / MUI 5 still mount through findDOMNode. React reports
  // the deprecation itself; it is not an app failure.
  /findDOMNode is deprecated/,
  // Chrome's own layout-loop guard (fires on animated carousels).
  /ResizeObserver loop/,
  // Cross-origin script without CORS headers - the message carries no stack.
  /^Script error\.?$/,
  // Next.js logs this when a client-side navigation is cancelled. The crawler
  // cancels one every time it restores a page right after clicking a link, so
  // these two lines say "the test navigated away", not "the app is broken".
  /Abort fetching component for route/,
  /Loading initial props cancelled/,
];

/** Assets that legitimately 404 in dev (the "TT Ramillas" webfont family). */
const ASSET_NOISE = /\.(woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|ico|map)(\?|$)/i;

/**
 * Third-party hosts whose requests are blocked: they must not record crawl
 * traffic in the real analytics property, and a blocked beacon would otherwise
 * show up as a console error on every page.
 */
const BLOCKED_THIRD_PARTIES = [
  /google-analytics\.com/,
  /googletagmanager\.com\/g\/collect/,
  /doubleclick\.net/,
  /clarity\.ms/,
  /connect\.facebook\.net/,
  /hotjar\.com/,
];

/**
 * Endpoints allowed to answer 4xx/5xx without failing the crawl: they are polled
 * with ids that only exist after a real booking. `CRAWL_STRICT_API=1` turns them
 * into failures too (useful right after touching one of them).
 */
const TOLERATED_API_ERRORS: RegExp[] = [
  /\/api\/payment\/status/,
  /\/api\/getAppointmentId\//,
  /\/api\/slots\//,
  /\/api\/logs\/clientError/,
];

const STRICT_API = process.env.CRAWL_STRICT_API === '1';

const unique = (values: string[]) => Array.from(new Set(values));

/**
 * Raised when an in-page operation never comes back: a renderer that is stuck in
 * an infinite render loop keeps its main thread busy, so `evaluate` never
 * resolves and Playwright's own action timeouts (which are enforced *in* the
 * page) can stall too. A hard race is the only reliable watchdog.
 */
export class CrawlTimeoutError extends Error {}

export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new CrawlTimeoutError(
                `⏱ ${label} did not respond within ${ms}ms - the page's main thread ` +
                  'looks blocked (infinite render loop / stuck async task?)',
              ),
            ),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** How long a single DOM read may take before the page counts as frozen. */
const DOM_READ_TIMEOUT_MS = Number(process.env.CRAWL_DOM_TIMEOUT_MS ?? 15_000);

const locationOf = (message: ConsoleMessage) => {
  try {
    const { url, lineNumber } = message.location();
    return url ? { url, lineNumber } : null;
  } catch {
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* Error monitor                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Collects everything that went wrong on the current page.
 *
 * `issues` fail the test, `warnings` are printed in the summary only. The split
 * exists because this suite runs against `next dev`, where a missing font, a
 * deprecated React API and a red 404 for an image are all logged the same way as
 * a real exception.
 */
export class SiteMonitor {
  readonly issues: CrawlIssue[] = [];
  readonly warnings: string[] = [];
  readonly blockedWrites: string[] = [];

  private page = '/';
  private step = 'load';
  private readonly warnedKeys = new Set<string>();

  constructor(private readonly target: Page) {}

  /** Registers the listeners. Call once, before the first navigation. */
  attach(): this {
    this.target.on('pageerror', (error) => {
      this.push({ kind: 'pageerror', detail: error.message, stack: error.stack });
    });
    this.target.on('console', (message) => this.onConsole(message));
    this.target.on('response', (response) => this.onResponse(response));
    return this;
  }

  /** Marks the current route + step so every issue says where it happened. */
  setContext(page: string, step: string) {
    this.page = page;
    this.step = step;
  }

  reset() {
    this.issues.length = 0;
    this.warnings.length = 0;
    this.warnedKeys.clear();
  }

  private push(issue: Omit<CrawlIssue, 'page' | 'step'>) {
    // A component that throws on every render logs the same error dozens of
    // times; one entry per page is enough to fix it.
    const duplicate = this.issues.some(
      (existing) =>
        existing.kind === issue.kind &&
        existing.detail === issue.detail &&
        existing.page === this.page,
    );
    if (duplicate) return;
    this.issues.push({ ...issue, page: this.page, step: this.step });
  }

  private warn(message: string) {
    // Deduped per page (not per step): the same missing font is logged on every
    // click otherwise, which buries the interesting warnings.
    const key = `${this.page} ${message}`;
    if (this.warnedKeys.has(key)) return;
    this.warnedKeys.add(key);
    this.warnings.push(`${this.page} [${this.step}] ${message}`);
  }

  private onConsole(message: ConsoleMessage) {
    const type = message.type();
    if (type !== 'error') {
      // A console.warn is not a failure, but printing it makes third-party
      // problems visible in the summary.
      if (type === 'warning' && !/DevTools|findDOMNode|ResizeObserver/.test(message.text())) {
        this.warn(`console.warning: ${message.text().slice(0, 200)}`);
      }
      return;
    }

    const text = message.text();
    const location = locationOf(message);
    const url = location?.url ?? '';

    // A red "Failed to load resource" line is emitted for every 404 asset and for
    // every API response >= 400. Both are classified, not dumped straight into
    // the failure list.
    if (/Failed to load resource/i.test(text)) {
      const status = Number(text.match(/status of (\d{3})/)?.[1] ?? 0);
      if (ASSET_NOISE.test(url) || BLOCKED_THIRD_PARTIES.some((host) => host.test(url))) {
        this.warn(`asset ${status || '?'} ${url || '(unknown asset)'}`);
        return;
      }
      if (/\/api\//.test(url)) {
        this.onApiFailure(url, status, 'console');
        return;
      }
      // Any other resource 404 (a JS chunk, a CSS file): the failure itself is
      // reported by the "Failed to load script" console.error / the document
      // 404 that caused it, so keep this one as context only.
      this.warn(`resource ${status || '?'} ${url || '(unknown)'}`);
      return;
    }

    if (IGNORED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) {
      this.warn(`console.error (allowlisted): ${text.slice(0, 200)}`);
      return;
    }

    // React logs a render crash as "The above error occurred in the <X>
    // component" before the boundary renders its fallback; that line is kept as
    // context, the `pageerror` handler carries the real stack.
    this.push({
      kind: 'console-error',
      detail: text.slice(0, 600),
      stack: location ? `${url}:${location.lineNumber}` : undefined,
    });
  }

  private onApiFailure(url: string, status: number, via: string) {
    const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0] || '(inline)';
    const tolerated = TOLERATED_API_ERRORS.some((pattern) => pattern.test(path));
    const line = `API ${status || '?'} ${path} (${via})`;
    if (tolerated && !STRICT_API) {
      this.warn(line);
      return;
    }
    this.push({ kind: 'http-error', detail: line });
  }

  private onResponse(response: Response) {
    const status = response.status();
    if (status < 400) return;

    const request = response.request();
    // Assets + XHR are already reported (or allowlisted) by the console handler.
    // Here we only care about *documents*, where a 4xx/5xx means a broken route
    // or a dead internal link.
    if (request.resourceType() !== 'document') return;
    if (response.frame() !== this.target.mainFrame()) return;

    const path = response.url().replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    this.push({ kind: 'http-error', detail: `document ${status} ${path}` });
  }
}

/* -------------------------------------------------------------------------- */
/* Safety guard - a crawl must never write anything                            */
/* -------------------------------------------------------------------------- */

/**
 * Fulfils every non-GET `/api/**` call with a stub, blocks the payment SDK and
 * the analytics beacons.
 *
 * Without this, clicking "Continue" on `/appointment` sends a real WhatsApp OTP,
 * and "Proceed to Pay" creates a real Cashfree order. The stub keeps the client
 * code alive (GETs are untouched, so the crawler still sees real data and real
 * layout) while guaranteeing that no booking, payment, message or error-sheet
 * write can leave the browser.
 */
export async function installWriteGuard(page: Page, monitor: SiteMonitor) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      await route.continue();
      return;
    }
    monitor.blockedWrites.push(`${method} ${new URL(request.url()).pathname}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, blockedByCrawler: true }),
    });
  });

  // The Cashfree SDK injects the hosted checkout; replace it with a stub.
  await page.route('https://sdk.cashfree.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.Cashfree = function () { return { checkout: function () { return Promise.resolve({}); } }; };',
    }),
  );

  await page.route(
    (url) => BLOCKED_THIRD_PARTIES.some((host) => host.test(url.href)),
    (route) => route.abort(),
  );
}

/* -------------------------------------------------------------------------- */
/* Crash / fallback detection                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The sentences that only appear when a page has failed.
 *
 * The ErrorBoundary fallback and `pages/_error.js` share the "Something went
 * wrong" headline on purpose (one message for the patient), so detection keys on
 * the body sentence instead - otherwise every legitimate 404 would look like a
 * crash. `[data-nextjs-dialog]` / `[data-nextjs-toast]` are Next's dev overlay
 * (Playwright pierces its open shadow root); it appears for render errors and for
 * compile errors, both of which must fail the crawl.
 */
const CRASH_SIGNALS: Array<{ selector: string; label: string }> = [
  { selector: '[data-nextjs-dialog]', label: 'Next.js dev error overlay (dialog)' },
  { selector: '[data-nextjs-toast]', label: 'Next.js dev error toast' },
  {
    selector: 'text=/Application error: a client-side exception/i',
    label: 'Next.js "Application error" screen',
  },
  {
    selector: 'text=/This part of the page could not be displayed/i',
    label: 'ErrorBoundary fallback',
  },
  { selector: 'text=/Unhandled Runtime Error/i', label: 'React runtime error screen' },
  { selector: 'text=/Minified React error/i', label: 'Minified React crash' },
];

/** Returns the crash signal visible right now, or `null`. */
export async function detectCrashUi(page: Page): Promise<string | null> {
  for (const signal of CRASH_SIGNALS) {
    const visible = await page
      .locator(signal.selector)
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (visible) return signal.label;
  }
  return null;
}

/**
 * Fails with the crash signal, the visible fallback text and every error the page
 * reported - i.e. both halves of "the UI broke" and "here is the stack".
 */
export async function assertNoCrash(page: Page, monitor: SiteMonitor, step: string) {
  const signal = await detectCrashUi(page);
  if (!signal) return;

  monitor.setContext(pathOf(page.url()), step);
  const body = await page.locator('body').innerText().catch(() => '');
  throw new Error(
    [
      `💥 ${signal} on ${page.url()} during ${step}`,
      'Visible text:',
      body.replace(/\s+/g, ' ').slice(0, 600),
      monitor.issues.length ? `\nCollected issues:\n${formatIssues(monitor.issues)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

export function formatIssues(issues: CrawlIssue[]): string {
  return issues
    .map(
      (issue, index) =>
        `${index + 1}. [${issue.kind}] ${issue.page} · ${issue.step}\n   ${issue.detail}${
          issue.stack ? `\n${issue.stack}` : ''
        }`,
    )
    .join('\n');
}

/* -------------------------------------------------------------------------- */
/* Navigation helpers                                                          */
/* -------------------------------------------------------------------------- */

export const pathOf = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

export const pathnameOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split('?')[0];
  }
};

/** The app boots behind a full-screen overlay (`img[alt="Loading..."]`). */
export async function waitForAppBoot(page: Page, timeout = 45_000) {
  await page
    .locator('img[alt="Loading..."]')
    .waitFor({ state: 'hidden', timeout })
    .catch(() => {});
}

/**
 * `page.goto` + boot wait + a *best effort* networkidle.
 *
 * networkidle is wrapped in try/catch on purpose: several pages poll
 * (`/payment/thankyou` every 3s, the appointment page's slot lookup) and would
 * never go idle - the classic source of crawler flakiness. A timeout here means
 * "the page is still busy", not "the page failed".
 */
export async function openPage(page: Page, url: string, timeout = 90_000) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  await waitForAppBoot(page);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  return response;
}

/* -------------------------------------------------------------------------- */
/* Link + clickable discovery                                                  */
/* -------------------------------------------------------------------------- */

const NON_PAGE_LINK = /^(mailto:|tel:|javascript:|sms:|whatsapp:|intent:)/i;
const NON_PAGE_ASSET = /\.(pdf|zip|docx?|xlsx?|csv|png|jpe?g|gif|svg|webp|mp4|mp3|ico)(\?|$)/i;

/**
 * Same-origin, crawlable links on the current page.
 *
 * Query strings are kept (deep links such as `/department-single?id=...` are real
 * routes) but the caller dedupes by pathname, so one representative URL per route
 * is visited. `href="#"` is skipped here: those are the header dropdown toggles,
 * which the click phase covers instead.
 */
export async function collectInternalLinks(page: Page, origin: string): Promise<string[]> {
  const hrefs = await withTimeout(
    page.locator('a[href]').evaluateAll((nodes) =>
      nodes.map((node) => ({
        href: node.getAttribute('href') ?? '',
        target: node.getAttribute('target') ?? '',
      })),
    ),
    DOM_READ_TIMEOUT_MS,
    `reading the links on ${pathnameOf(page.url())}`,
  ).catch((error) => {
    if (error instanceof CrawlTimeoutError) throw error;
    return [] as Array<{ href: string; target: string }>;
  });

  const links: string[] = [];
  for (const { href, target } of hrefs) {
    if (!href || href.startsWith('#') || NON_PAGE_LINK.test(href) || target === '_blank') continue;

    let resolved: URL;
    try {
      resolved = new URL(href, origin);
    } catch {
      continue;
    }
    if (resolved.origin !== origin) continue;
    if (NON_PAGE_ASSET.test(resolved.pathname)) continue;
    if (resolved.pathname.startsWith('/_next/') || resolved.pathname.startsWith('/api/')) continue;

    links.push(`${resolved.pathname}${resolved.search}`);
  }
  return unique(links);
}

export interface ClickTarget {
  /** Stable key used to find the element again after a re-render. */
  key: string;
  label: string;
  tag: string;
  href: string;
  index: number;
}

/**
 * Primary controls: real <button>s, role=button, the shared `.consultation-btn`
 * CTA, submit inputs and bootstrap toggles (nav dropdowns / accordions).
 *
 * Plain text links are deliberately *not* clicked - they are covered by the route
 * crawl, and clicking every footer link on every page would multiply the runtime
 * without testing anything new.
 */
export const CLICKABLE_SELECTOR = [
  'button',
  '[role="button"]',
  'a.consultation-btn',
  '.consultation-btn',
  'a.btn',
  'input[type="submit"]',
  'input[type="button"]',
  '[data-bs-toggle]',
].join(', ');

/**
 * Controls that must not be clicked by an automated crawl: they delete data, end
 * a session, or open a payment / messaging flow. Anything matching is reported as
 * "skipped" so the gap stays visible in the summary.
 */
const SKIP_CLICK_LABELS =
  /(delete|remove|logout|log out|sign out|sign-out|pay now|pay securely|proceed to pay|confirm payment|make payment|cancel appointment|unsubscribe|deactivate|block|download|print|share|whatsapp|call now|resend)/i;

interface RawClickable {
  tag: string;
  label: string;
  href: string;
  target: string;
  disabled: boolean;
  visible: boolean;
}

export async function collectClickTargets(page: Page, limit = 60): Promise<ClickTarget[]> {
  const raw = await withTimeout(
    page.locator(CLICKABLE_SELECTOR).evaluateAll((nodes, max) =>
      nodes.slice(0, max * 4).map((node) => {
        const element = node as HTMLElement;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const anchor = element.closest('a');
        // `checkVisibility` also catches the menus/carousels hidden through an
        // ancestor's `opacity: 0` (opacity is not inherited, so computed style on
        // the element itself says 1). Those are collected otherwise and then fail
        // to click.
        const cssVisible =
          typeof (element as HTMLElement & { checkVisibility?: Function }).checkVisibility ===
          'function'
            ? (element as HTMLElement & {
                checkVisibility: (options?: object) => boolean;
              }).checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
            : true;
        return {
          tag: element.tagName.toLowerCase(),
          label: (
            element.getAttribute('aria-label') ||
            (element as HTMLInputElement).value ||
            element.innerText ||
            element.getAttribute('title') ||
            ''
          )
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80),
          href: anchor?.getAttribute('href') ?? '',
          target: anchor?.getAttribute('target') ?? '',
          disabled: (element as HTMLButtonElement).disabled === true,
          visible:
            cssVisible &&
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            style.opacity !== '0',
        };
      }),
    limit),
    DOM_READ_TIMEOUT_MS,
    `reading the controls on ${pathnameOf(page.url())}`,
  ).catch((error) => {
    if (error instanceof CrawlTimeoutError) throw error;
    return [] as RawClickable[];
  });

  const targets: ClickTarget[] = [];
  raw.forEach((item, index) => {
    if (!item.visible || item.disabled) return;
    if (item.target === '_blank') return;
    if (item.href && NON_PAGE_LINK.test(item.href)) return;
    if (item.href && NON_PAGE_ASSET.test(item.href)) return;

    const key = `${item.tag}::${item.label}::${item.href}`;
    if (!item.label && !item.href) return;
    if (targets.some((existing) => existing.key === key)) return;

    targets.push({ key, label: item.label || item.href, tag: item.tag, href: item.href, index });
  });

  return targets.slice(0, limit);
}

export const shouldSkipClick = (target: ClickTarget) => SKIP_CLICK_LABELS.test(target.label);

/* -------------------------------------------------------------------------- */
/* Clicking + state restoration                                                */
/* -------------------------------------------------------------------------- */

/**
 * Clicks without the usual flake: scrolls the element into view, retries with
 * `force` (sticky headers, cookie strips and open dropdowns overlay real
 * controls), and treats a detached/re-rendered element as "missing" - the caller
 * then re-collects the targets instead of failing on a race.
 */
export async function clickTarget(
  page: Page,
  target: ClickTarget,
): Promise<'clicked' | 'missing' | 'blocked'> {
  // The DOM index collected earlier is only valid for the snapshot it came from;
  // a re-render, a closed dropdown or a restored page shifts it. Re-resolve the
  // element by its key, then click the index that is correct *now* - that is what
  // makes "duplicate button selectors" (desktop nav + mobile nav + sticky nav)
  // work without hard-coded `nth(...)` guesses.
  const fresh = (await collectClickTargets(page, 400)).find((item) => item.key === target.key);
  if (!fresh) return 'missing';

  const locator = page.locator(CLICKABLE_SELECTOR).nth(fresh.index);
  if ((await locator.count().catch(() => 0)) === 0) return 'missing';

  if (fresh.label) {
    const text = (await locator.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    if (!text.startsWith(fresh.label)) return 'missing';
  }

  await locator.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => {});
  try {
    await locator.click({ timeout: 7_500 });
    return 'clicked';
  } catch {
    // Second attempt: the click point was covered (fixed header / open dropdown).
    try {
      await locator.click({ timeout: 5_000, force: true });
      return 'clicked';
    } catch {
      return 'blocked';
    }
  }
}

/**
 * Waits for whatever the click started to finish before the crawler touches the
 * page again.
 *
 * Restoring too early aborts Next.js' in-flight route fetch, which the router
 * logs as `Error: Abort fetching component for route` - a red console line the
 * crawler itself caused. networkidle is best effort (pages poll, dialogs animate),
 * so it is capped and never fatal.
 */
export async function settleAfterClick(page: Page, settleMs: number) {
  await page.waitForTimeout(settleMs);
  // A navigation that has started but not committed leaves the Next router
  // fetching; letting the document arrive before restoring avoids aborting it.
  await page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});
  await waitForAppBoot(page, 20_000);
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
}

const dialogLocator = (page: Page) =>
  page.locator('[role="dialog"], .modal.show, .MuiDialog-root');

/**
 * Brings the browser back to a clean copy of `origin` before the next click.
 *
 * Restoring is cheap when nothing happened (an accordion toggle) and only reloads
 * when the click opened a dialog or navigated away, so a page with ten controls
 * does not pay for ten full loads.
 */
export async function restorePage(page: Page, origin: string) {
  // The click itself was already settled by the caller (`settleAfterClick`); this
  // short pause is only for the dialog / route transition to finish animating.
  await page.waitForTimeout(150);

  if (pathOf(page.url()) !== pathOf(origin)) {
    await openPage(page, origin).catch(() => {});
    return;
  }

  const dialogs = dialogLocator(page);
  if ((await dialogs.count().catch(() => 0)) === 0) {
    // The mobile nav leaves `body.wsactive` behind (it locks scrolling), which
    // would make every later click land on an invisible overlay.
    await page.evaluate(() => document.body.classList.remove('wsactive')).catch(() => {});
    return;
  }

  await page.keyboard.press('Escape').catch(() => {});
  const backdrop = page.locator('.MuiBackdrop-root, .modal-backdrop');
  if ((await backdrop.count().catch(() => 0)) > 0) {
    await backdrop.first().click({ force: true, timeout: 2_000 }).catch(() => {});
  }
  if (await dialogs.first().isVisible().catch(() => false)) {
    // A dialog that ignores Escape/backdrop: a reload is the only reliable reset.
    await openPage(page, origin).catch(() => {});
  }
}

/**
 * Clicks that open a new tab leave a second page behind; close it, otherwise the
 * crawler keeps acting on a page it is not monitoring.
 */
export async function closeExtraTabs(page: Page, settleMs = 300) {
  const pages = page.context().pages();
  if (pages.length <= 1) return 0;

  let closed = 0;
  for (const extra of pages) {
    if (extra === page) continue;
    await extra.close().catch(() => {});
    closed += 1;
  }
  await page.bringToFront().catch(() => {});
  await page.waitForTimeout(settleMs);
  return closed;
}

/* -------------------------------------------------------------------------- */
/* Report                                                                      */
/* -------------------------------------------------------------------------- */

const RULE = '════════════════════════════════════════════════════════════════════';
const THIN = '────────────────────────────────────────────────────────────────────';

export function printReport(report: CrawlReport) {
  const clicked = report.visited.reduce((total, row) => total + row.clicks, 0);
  const skipped = report.visited.reduce((total, row) => total + row.skippedClicks, 0);

  const lines = [
    '',
    RULE,
    ' SITE CRAWL SUMMARY',
    RULE,
    ` base URL         : ${report.baseURL}`,
    ` pages visited    : ${report.visited.length}`,
    ` controls clicked : ${clicked}`,
    ` controls skipped : ${skipped} (destructive / payment / messaging)`,
    ` blocked writes   : ${unique(report.blockedWrites).length} (nothing was sent)`,
    ` warnings         : ${report.warnings.length}`,
    ` issues           : ${report.issues.length}`,
    THIN,
    ' PAGES',
    ...report.visited.map(
      (row) =>
        `  ${String(row.status || '-').padEnd(4)}${row.path}  ·  ${row.clicks} clicked, ` +
        `${row.skippedClicks} skipped, ${(Math.round(row.durationMs / 100) / 10).toFixed(1)}s`,
    ),
  ];

  if (report.blockedWrites.length) {
    lines.push(THIN, ' BLOCKED WRITES');
    lines.push(...unique(report.blockedWrites).map((entry) => `  ${entry}`));
  }

  if (report.warnings.length) {
    lines.push(THIN, ' WARNINGS (not failures)');
    lines.push(...report.warnings.map((entry) => `  ${entry}`));
  }

  if (report.issues.length) {
    lines.push(THIN, ' ISSUES (failures)');
    lines.push(formatIssues(report.issues));
  }

  lines.push(RULE, '');
  console.log(lines.join('\n'));
}

/** Turns the collected issues into one readable assertion failure. */
export function expectNoIssues(issues: CrawlIssue[]) {
  expect(
    issues,
    `The crawl hit ${issues.length} runtime error(s):\n\n${formatIssues(issues)}`,
  ).toEqual([]);
}







