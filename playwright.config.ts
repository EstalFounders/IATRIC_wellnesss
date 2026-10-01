import { defineConfig, devices } from '@playwright/test';

/**
 * Fake media devices (used by the meeting-room suite, which needs a camera +
 * microphone that do not exist on the machine running the tests). Every project
 * gets the platform-specific way of providing synthetic devices, while
 * `use.permissions` pre-grants the camera/microphone prompt for all browsers:
 *   Chromium -> command line flags
 *   WebKit   -> the same fake-device flags (honoured by Playwright's WebKit build)
 *   Firefox  -> prefs instead of flags
 */
const CHROMIUM_FAKE_MEDIA = {
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ],
};

const WEBKIT_FAKE_MEDIA = {
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
};

const FIREFOX_FAKE_MEDIA = {
  firefoxUserPrefs: {
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true,
  },
};

/**
 * Camera/microphone are pre-granted so no test ever sees a permission prompt.
 * NOTE: Playwright only accepts the `camera` / `microphone` permission names on
 * Chromium and WebKit - Firefox throws `Unknown permission: camera`, which is why
 * the Firefox project relies on the prefs above instead.
 */
const MEDIA_PERMISSIONS: Array<'camera' | 'microphone'> = ['camera', 'microphone'];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Compile the routes the suite touches before any browser connects (dev-server warm-up) */
  globalSetup: require.resolve('./playwright.global-setup'),
  /* Maximum time one test can run (Next.js compiles pages on demand, so keep this generous) */
  timeout: 180_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Assertion timeout (payment polling / slow device emulation) */
  expect: { timeout: 15_000 },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    /* Next.js dev server can take a while to compile a route on first visit */
    navigationTimeout: 90_000,

    /* Artifacts kept for failed runs (open them from test-results/ or the HTML report) */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Every suite runs on all desktop + mobile + tablet devices below. */
  projects: [
    /* -------- Desktop (Chrome 1280x720 + 1920x1080, Firefox, Safari) -------- */
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...CHROMIUM_FAKE_MEDIA },
      },
    },

    {
      name: 'Desktop Chrome FullHD',
      use: {
        ...devices['Desktop Chrome'],
        // 1920x1080 desktop. `viewport` must come after the device spread.
        viewport: { width: 1920, height: 1080 },
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...CHROMIUM_FAKE_MEDIA },
      },
    },

    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...FIREFOX_FAKE_MEDIA,
      },
    },

    {
      name: 'Desktop WebKit',
      use: {
        ...devices['Desktop Safari'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...WEBKIT_FAKE_MEDIA },
      },
    },

    /* -------- Mobile viewports -------- */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...CHROMIUM_FAKE_MEDIA },
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 14'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...WEBKIT_FAKE_MEDIA },
      },
    },

    /* -------- Tablet viewports (portrait + landscape) -------- */
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['Galaxy Tab S9'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...CHROMIUM_FAKE_MEDIA },
      },
    },

    {
      name: 'Tablet Safari',
      use: {
        // iPad Mini portrait (~768x1024)
        ...devices['iPad Mini'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...WEBKIT_FAKE_MEDIA },
      },
    },

    {
      name: 'Tablet Safari Landscape',
      use: {
        ...devices['iPad Mini landscape'],
        permissions: MEDIA_PERMISSIONS,
        launchOptions: { ...WEBKIT_FAKE_MEDIA },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
