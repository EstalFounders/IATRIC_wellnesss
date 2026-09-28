import { test, expect, type Page } from '@playwright/test';

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

const WHATSAPP_CONFIRMATION_API = /\/api\/helper\/whatsappConfirmationApi$/;
const BOOK_CONSULTATION_API = /\/api\/bookConsultation\/?(\?|$)/;
const CREATE_ORDER_API = /\/api\/payment\/create-order$/;
const PAYMENT_STATUS_API = /\/api\/payment\/status/;

type CapturedWhatsApp = { method: string; body: { mobile?: string; otp?: string } };

async function fillAppointmentForm(page: Page) {
  const form = page.locator('form.appointment-form');

  await page.getByLabel('Name', { exact: true }).fill(TEST_NAME);
  // Bootstrap ToggleButton clips its native input (pointer-events:none), so the
  // visible chip/segment label is the real click target — click it like a user.
  await page.locator(`label[id="symptom-${TEST_SYMPTOM}"]`).click();
  await page.getByLabel('Mobile Number', { exact: true }).fill(TEST_MOBILE);
  // Consultation type/service is fed from the live ServiceOffered collection.
  await page.locator(`label[id="consultation-${CONSULTATION_TYPE}"]`).click();

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

    // Lets the stubbed Cashfree SDK report back to the test (survives navigation).
    const context = page.context();
    await context.exposeFunction('__e2eCashfreeCheckout', (payload: {
      mode?: string;
      options?: Record<string, unknown>;
    }) => {
      checkoutCalls.push(payload);
    });

    // Replace the Cashfree sandbox checkout SDK. The app still calls
    // load({ mode: 'sandbox' }) + checkout({ paymentSessionId, returnUrl }); the stub
    // records that call and simulates a completed sandbox payment by returning the
    // browser to the app return URL with the order id - no real payment is made.
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
    await expect(page.getByRole('heading', { name: 'Make Appointment' })).toBeVisible();

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
      timeout: 60_000,
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
    await expect(returnPage.getByText('Thank you!')).toBeVisible();
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
});

