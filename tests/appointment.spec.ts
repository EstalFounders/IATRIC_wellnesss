import { test, expect, type BrowserContext, type Page } from '@playwright/test';

/**
 * Appointment booking E2E - single suite, executed on every configured device
 * project (Desktop Chrome / Firefox / WebKit, Mobile Chrome, Mobile Safari, tablets).
 *
 * Real, un-mocked parts of the app exercised here:
 *   GET  /api/superAdmin/serviceOffered  -> consultation types + fees (Audio / Video)
 *   GET  /api/addDoctor                  -> doctor list
 *   the whole appointment page flow, client-side OTP gate, Cashfree `load({mode:'sandbox'})`
 *   + `checkout()` call, /payment/thankyou status polling and the appointment
 *   confirmation modal.
 *
 * Mocked (3rd-party / side effecting) boundaries - nothing real is charged or messaged:
 *   POST /api/helper/whatsappConfirmationApi  -> the WhatsApp confirmation API (sends the
 *        OTP template). Intercepted + asserted, so NO real WhatsApp message is sent.
 *   POST /api/bookConsultation                -> appointment creation (also asserted).
 *   POST /api/payment/create-order            -> Cashfree order creation.
 *   the Cashfree sandbox checkout SDK (https://sdk.cashfree.com/js/v3/cashfree.js) is
 *        replaced by an in-page stub that completes the SANDBOX checkout and returns the
 *        browser to the app's return URL (/payment/thankyou?appointmentId=<order_id>).
 *   GET  /api/payment/status                  -> Cashfree order verification (PAID).
 */

const TEST_NAME = 'E2E Test Patient';
const TEST_MOBILE = '9876543210';
const TEST_SYMPTOM = 'Fever';
const CONSULTATION_TYPE = 'Audio';
const CONSULTATION_FEE = 199;

// Sandbox artefacts returned by the mocked Cashfree order + checkout
const SANDBOX_SESSION_ID = 'sandbox_e2e_payment_session';
const ORDER_ID = 'HP_E2E_SANDBOX_ORDER_1';
const APPOINTMENT_ID = 'e2e_appointment_0001';

/**
 * OTP note: the appointment OTP screen validates the code client-side
 * (src/components/Appointment/OtpConfirmationPopup.js:104) and accepts only the OTP it just
 * generated (or the built-in "000000" test code). The requested test OTP "111000" is not
 * accepted by the current implementation, so the suite enters it first and asserts the
 * rejection, then completes the flow with the OTP the app actually issued - captured from
 * the intercepted WhatsApp confirmation API request (no bypass needed).
 */
const REJECTED_TEST_OTP = '111000';

/**
 * First-paint budget for a cold page load. The whole app body is rendered on the client
 * (pages/_app.js wraps the tree in <NoSsr> + redux-persist <PersistGate loading={null}>),
 * so nothing paints - not even the Preloader overlay - until the dev bundle has loaded and
 * the store has rehydrated. This suite runs 9 device projects in parallel against a single
 * Next dev server, which can push that well past the config default (expect.timeout = 15s);
 * it showed up as a blank white page on Mobile Safari at the first assertion after
 * page.goto('/appointment'). Only the first assertion of a freshly loaded document needs
 * this budget - everything after it runs against an already-booted app.
 */
const PAGE_READY_TIMEOUT = 60_000;

const WHATSAPP_CONFIRMATION_API = /\/api\/helper\/whatsappConfirmationApi$/;
const BOOK_CONSULTATION_API = /\/api\/bookConsultation\/?(\?|$)/;
const CREATE_ORDER_API = /\/api\/payment\/create-order$/;
const PAYMENT_STATUS_API = /\/api\/payment\/status/;

type CapturedWhatsApp = { method: string; body: { mobile?: string; otp?: string } };

/** Fills every field that does not depend on the "When" choice. */
async function fillAppointmentFormFields(page: Page) {
  const form = page.locator('form.appointment-form');

  await page.getByLabel('Name', { exact: true }).fill(TEST_NAME);
  // Bootstrap ToggleButton clips its native input (pointer-events:none), so the
  // visible chip/segment label is the real click target — click it like a user.
  await page.locator(`label[id="symptom-${TEST_SYMPTOM}"]`).click();
  await page.getByLabel('Mobile Number', { exact: true }).fill(TEST_MOBILE);
  // Consultation type/service is fed from the live ServiceOffered collection.
  await page.locator(`label[id="consultation-${CONSULTATION_TYPE}"]`).click();

  return form;
}

async function fillAppointmentForm(page: Page) {
  const form = await fillAppointmentFormFields(page);

  // Time: "Choose Time" -> date picker + slot dropdown (locally generated slots)
  await page.locator('label[id="when-later"]').click();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  await form.locator('input[type="date"]').fill(tomorrowStr);

  const slotSelect = form.locator('select[name="slot"]');
  await expect(slotSelect).toBeVisible();
  await slotSelect.selectOption({ index: 1 }); // index 0 is the disabled placeholder

  await form.getByRole('checkbox').check();

  return form;
}

async function enterOtp(page: Page, code: string) {
  // The appointment form's Mobile Number field is also inputmode="numeric" and
  // stays in the DOM behind the popup, so scope to the 6 single-character OTP
  // boxes instead of every numeric input on the page.
  const boxes = page.locator('input[inputmode="numeric"][maxlength="1"]');
  await expect(boxes).toHaveCount(6);
  for (let i = 0; i < code.length; i += 1) {
    await boxes.nth(i).fill(code[i]);
  }
}

type CheckoutCall = { mode?: string; options?: Record<string, unknown> };

/**
 * Replaces the Cashfree sandbox checkout SDK. The app still calls
 * load({ mode: 'sandbox' }) + checkout({ paymentSessionId, returnUrl }); the stub
 * records that call and simulates a completed sandbox payment by returning the
 * browser to the app return URL with the order id - no real payment is made.
 */
async function stubCashfreeCheckout(context: BrowserContext, sink: CheckoutCall[]) {
  // Lets the stubbed SDK report back to the test (survives navigation).
  await context.exposeFunction('__e2eCashfreeCheckout', (payload: CheckoutCall) => {
    sink.push(payload);
  });

  await context.addInitScript((orderId: string) => {
    const w = window as any;
    w.__e2eOrderId = orderId;
    w.Cashfree = (config: { mode?: string }) => ({
      checkout: (options: Record<string, unknown>) => {
        if (typeof w.__e2eCashfreeCheckout === 'function') {
          w.__e2eCashfreeCheckout({ mode: config?.mode, options });
        }
        w.location.assign(
          `/payment/thankyou?appointmentId=${encodeURIComponent(w.__e2eOrderId)}`
        );
        return Promise.resolve();
      },
    });
  }, ORDER_ID);
}

// ── "Now" fallback fixtures ────────────────────────────────────────────────
// Shape returned by pages/api/helper.js when the patient asked for "Now" and no
// doctor has a free slot left today: `status: 304` (SERVER_AVAILABLE_SLOTS_CODE)
// plus the next free slots, each directly bookable via its `_id`.
const FALLBACK_MESSAGE = 'No slots available for today. Here are the next available slots.';
const AVAILABLE_SLOTS_STATUS = '304';

const alternativeSlotTime = (dayOffset: number, hour: number, minute: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const ALTERNATIVE_SLOTS = [
  {
    _id: '64b7f00000000000000b0001',
    doctorId: '64b7f00000000000000a0001',
    doctorName: 'Dr. Alternative One',
    doctorMobileNumber: '9000000001',
    startTime: alternativeSlotTime(1, 10, 0),
    endTime: alternativeSlotTime(1, 10, 20),
  },
  {
    _id: '64b7f00000000000000b0002',
    doctorId: '64b7f00000000000000a0002',
    doctorName: 'Dr. Alternative Two',
    doctorMobileNumber: '9000000002',
    startTime: alternativeSlotTime(1, 11, 0),
    endTime: alternativeSlotTime(1, 11, 20),
  },
  {
    _id: '64b7f00000000000000b0003',
    doctorId: '64b7f00000000000000a0001',
    doctorName: 'Dr. Alternative One',
    doctorMobileNumber: '9000000001',
    startTime: alternativeSlotTime(2, 9, 40),
    endTime: alternativeSlotTime(2, 10, 0),
  },
];

test.describe('Appointment booking (sandbox payment)', () => {
  test('books an appointment end to end and confirms it with a sandbox payment', async ({ page }) => {
    test.slow(); // dev-server first compile + full booking flow

    // ── Observability ────────────────────────────────────────────────
    const dialogs: string[] = [];
    const whatsappCalls: CapturedWhatsApp[] = [];
    let bookingBody: Record<string, unknown> | undefined;
    let createOrderBody: Record<string, unknown> | undefined;
    const statusCalls: string[] = [];
    const checkoutCalls: Array<{ mode?: string; options?: Record<string, unknown> }> = [];

    page.on('dialog', async (dialog) => {
      dialogs.push(`${dialog.type()}: ${dialog.message()}`);
      await dialog.dismiss();
    });

    const context = page.context();
    await stubCashfreeCheckout(context, checkoutCalls);

    // ── Mocked boundaries (context level, so a second page is covered too) ──
    // WhatsApp confirmation API (the OTP/WhatsApp sender). Mocked + asserted so that no
    // real WhatsApp message can leave the system during the test run.
    await context.route(WHATSAPP_CONFIRMATION_API, async (route) => {
      const request = route.request();
      whatsappCalls.push({
        method: request.method(),
        body: request.postDataJSON() as CapturedWhatsApp['body'],
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'SMS confirmation sent successfully' }),
      });
    });

    // Local booking API (persists the appointment) - mocked for deterministic,
    // side-effect free runs; the outgoing payload is still asserted below.
    await context.route(BOOK_CONSULTATION_API, async (route) => {
      bookingBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Consultation booked successfully',
          appointmentId: APPOINTMENT_ID,
          amount: CONSULTATION_FEE,
          consultationType: CONSULTATION_TYPE,
        }),
      });
    });

    // Cashfree order creation (server-side payment session) - mocked sandbox order.
    await context.route(CREATE_ORDER_API, async (route) => {
      createOrderBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          paymentSessionId: SANDBOX_SESSION_ID,
          checkoutUrl: 'https://sandbox.cashfree.com/pg/view/sandbox',
          orderId: ORDER_ID,
          amount: CONSULTATION_FEE,
        }),
      });
    });

    // Server-side payment verification - mocked as a successful sandbox payment.
    await context.route(PAYMENT_STATUS_API, async (route) => {
      statusCalls.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: 'PAID',
          orderId: ORDER_ID,
          appointmentId: APPOINTMENT_ID,
          amount: CONSULTATION_FEE,
        }),
      });
    });

    // Safety net: fail loudly if anything tries to reach the WhatsApp provider directly.
    await context.route(/fast2sms/i, async (route) => {
      await route.abort('blockedbyclient');
    });

    // ── 1. Open the Appointment page ────────────────────────────────
    await page.goto('/appointment');
    // First paint is client-only (see PAGE_READY_TIMEOUT): budget for the dev bundle.
    await expect(page.getByRole('heading', { name: 'Make Appointment' })).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });

    // ── 2./3. Fill the form and select consultation type, date + slot ──
    const form = await fillAppointmentForm(page);
    await expect(page.getByRole('radio', { name: CONSULTATION_TYPE })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Choose Time' })).toBeChecked();

    // ── 4. Book / Book Appointment ──────────────────────────────────
    const consultButton = form.locator('.consultation-btn');
    await expect(consultButton).toHaveText(/consult/i);
    await consultButton.click();

    // ── 5./11. WhatsApp confirmation API triggered with the right payload ──
    await expect(page.getByText('Verification Code')).toBeVisible();
    await expect.poll(() => whatsappCalls.length).toBe(1);
    expect(whatsappCalls[0].method).toBe('POST');
    expect(whatsappCalls[0].body.mobile).toBe(TEST_MOBILE);
    expect(whatsappCalls[0].body.otp).toMatch(/^\d{6}$/);
    const issuedOtp = whatsappCalls[0].body.otp as string;

    // ── 6. OTP: "111000" is rejected by the current OTP gate ────────
    await enterOtp(page, REJECTED_TEST_OTP);
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();
    await expect.poll(() => dialogs.length).toBeGreaterThan(0);
    expect(dialogs[dialogs.length - 1]).toContain('Invalid OTP entered.');

    // ...then verify with the OTP the app issued (message shown on WhatsApp).
    await enterOtp(page, issuedOtp);
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();

    // Booking request carries the data collected on the form.
    await expect.poll(() => bookingBody?.patientMobNo).toBe(TEST_MOBILE);
    expect(bookingBody).toMatchObject({
      name: TEST_NAME,
      patientMobNo: TEST_MOBILE,
      symptoms: TEST_SYMPTOM,
      consultationType: CONSULTATION_TYPE,
      consultationprice: CONSULTATION_FEE,
      appointmentTime: 'ChooseTime',
    });
    expect(bookingBody?.selectedSlot).toBeTruthy();

    // ── 7. Continue to the payment gateway (sandbox) ────────────────
    await expect(page.getByText(`Consultation Fee: ₹${CONSULTATION_FEE}`)).toBeVisible();
    const payButton = page.locator('.consultation-btn', { hasText: 'Pay ₹' });
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect.poll(() => createOrderBody?.appointmentId).toBe(APPOINTMENT_ID);
    expect(createOrderBody).toMatchObject({
      appointmentId: APPOINTMENT_ID,
      consultationType: CONSULTATION_TYPE,
    });

    // ── 8. Complete the sandbox payment (stubbed sandbox checkout) ──
    await expect.poll(() => checkoutCalls.length).toBe(1);
    expect(checkoutCalls[0].mode).toBe('sandbox');
    expect(checkoutCalls[0].options?.paymentSessionId).toBe(SANDBOX_SESSION_ID);

    // ── 9./10. Payment verified + confirmation state ────────────────
    // Wait for the app's real success state first, then assert the order details.
    await expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });
    await expect(
      page.getByText('Your payment was successful and your consultation has been confirmed.')
    ).toBeVisible();
    expect(page.url()).toContain(`/payment/thankyou?appointmentId=${ORDER_ID}`);
    await expect(page.getByText(ORDER_ID)).toBeVisible();
    await expect(page.getByText(`₹${CONSULTATION_FEE}`)).toBeVisible();

    await expect.poll(() => statusCalls.length).toBeGreaterThan(0);
    expect(statusCalls[0]).toContain(`orderId=${ORDER_ID}`);

    // Appointment page confirmation state (verify-only return path).
    // When returning from the sandbox checkout with ?appointmentId=<orderId> the app
    // auto-verifies the order and switches to the appointment confirmation modal.
    // Checked in its own page: a checkout return can leave a late navigation in flight on
    // the first page (seen on WebKit), which would race a page.goto() there.
    const statusCallsBeforeReturn = statusCalls.length;
    const returnPage = await context.newPage();
    await returnPage.goto(`/appointment?appointmentId=${ORDER_ID}`);
    // Fresh document => fresh client-side boot, so it gets the same first-paint budget.
    await expect(returnPage.getByText('Thank you!')).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });
    await expect(
      returnPage.getByText('Your consultation has been confirmed.').first()
    ).toBeVisible();

    // The returned order id was re-verified server-side (auto-poll of /api/payment/status).
    await expect.poll(() => statusCalls.length).toBeGreaterThan(statusCallsBeforeReturn);
    expect(statusCalls[statusCalls.length - 1]).toContain(`orderId=${ORDER_ID}`);
    await returnPage.close();

    // Exactly one (mocked) WhatsApp confirmation call, no real message sent.
    expect(whatsappCalls).toHaveLength(1);
  });

  test('offers the next free slots when "Now" has nothing left today and books one into checkout', async ({
    page,
  }) => {
    test.slow(); // dev-server first compile + booking + payment flow

    // ── Observability ────────────────────────────────────────────────
    const bookingBodies: Array<Record<string, unknown>> = [];
    const whatsappCalls: CapturedWhatsApp[] = [];
    let createOrderBody: Record<string, unknown> | undefined;
    const checkoutCalls: CheckoutCall[] = [];

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    const context = page.context();
    await stubCashfreeCheckout(context, checkoutCalls);

    // ── Mocked boundaries ───────────────────────────────────────────
    await context.route(WHATSAPP_CONFIRMATION_API, async (route) => {
      const request = route.request();
      whatsappCalls.push({
        method: request.method(),
        body: request.postDataJSON() as CapturedWhatsApp['body'],
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'SMS confirmation sent successfully' }),
      });
    });

    // Booking API: the "Now" attempt finds nothing free today and answers with the
    // 3 next available slots; the follow-up "Book" creates the appointment.
    await context.route(BOOK_CONSULTATION_API, async (route) => {
      bookingBodies.push(route.request().postDataJSON() as Record<string, unknown>);
      if (bookingBodies.length === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: FALLBACK_MESSAGE,
            nextSlots: ALTERNATIVE_SLOTS,
            status: AVAILABLE_SLOTS_STATUS,
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Consultation booked successfully',
          appointmentId: APPOINTMENT_ID,
          amount: CONSULTATION_FEE,
          consultationType: CONSULTATION_TYPE,
        }),
      });
    });

    await context.route(CREATE_ORDER_API, async (route) => {
      createOrderBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          paymentSessionId: SANDBOX_SESSION_ID,
          checkoutUrl: 'https://sandbox.cashfree.com/pg/view/sandbox',
          orderId: ORDER_ID,
          amount: CONSULTATION_FEE,
        }),
      });
    });

    await context.route(/fast2sms/i, async (route) => {
      await route.abort('blockedbyclient');
    });

    // ── 1. "Now" booking with nothing left today ────────────────────
    await page.goto('/appointment');
    await expect(page.getByRole('heading', { name: 'Make Appointment' })).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });

    const form = await fillAppointmentFormFields(page);
    await expect(page.getByRole('radio', { name: 'Now' })).toBeChecked();
    await form.getByRole('checkbox').check();
    await form.locator('.consultation-btn').click();

    // OTP gate (mocked sender) - "000000" is the built-in test code.
    await expect(page.getByText('Verification Code')).toBeVisible();
    await enterOtp(page, '000000');
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();

    // The booking attempt carried the "Now" choice and no slot.
    await expect.poll(() => bookingBodies.length).toBe(1);
    expect(bookingBodies[0]).toMatchObject({
      appointmentTime: 'Now',
      consultationType: CONSULTATION_TYPE,
      patientMobNo: TEST_MOBILE,
    });

    // ── 2. Fallback slots: one card, one direct "Book" button each ──
    await expect(page.getByText(FALLBACK_MESSAGE)).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });
    const bookButtons = page.getByRole('button', { name: 'Book', exact: true });
    await expect(bookButtons).toHaveCount(ALTERNATIVE_SLOTS.length);
    // No extra "Select"/calendar controls on these cards.
    await expect(page.getByRole('button', { name: 'Select', exact: true })).toHaveCount(0);
    await expect(page.getByText(ALTERNATIVE_SLOTS[0].doctorName).first()).toBeVisible();

    // ── 3. Book -> same booking call, pinned to the clicked slot ────
    await bookButtons.first().click();
    await expect.poll(() => bookingBodies.length).toBe(2);
    expect(bookingBodies[1]).toMatchObject({
      appointmentTime: 'ChooseTime',
      selectedDoctorId: ALTERNATIVE_SLOTS[0].doctorId,
      selectedSlot: { _id: ALTERNATIVE_SLOTS[0]._id },
      patientMobNo: TEST_MOBILE,
    });
    // No second OTP round trip for the fallback booking.
    expect(whatsappCalls).toHaveLength(1);

    // ── 4. Straight into the standard payment gateway ───────────────
    await expect(page.getByText(`Consultation Fee: ₹${CONSULTATION_FEE}`)).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });
    await page.locator('.consultation-btn', { hasText: 'Pay ₹' }).click();

    await expect.poll(() => createOrderBody?.appointmentId).toBe(APPOINTMENT_ID);
    await expect.poll(() => checkoutCalls.length).toBe(1);
    expect(checkoutCalls[0].mode).toBe('sandbox');
    expect(checkoutCalls[0].options?.paymentSessionId).toBe(SANDBOX_SESSION_ID);
  });
});

