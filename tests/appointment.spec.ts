import { test, expect, type BrowserContext, type Locator, type Page } from '@playwright/test';

/**
 * Appointment booking E2E - single suite, executed on every configured device
 * project (Desktop Chrome / Firefox / WebKit, Mobile Chrome, Mobile Safari, tablets).
 *
 * The booking is a four-step sequence (see AppointmentPage.js `bookingStep`):
 *   1. the page card collects name + mobile       -> "Continue"
 *   2. OTP modal verifies the mobile number       -> "Verify"
 *   3. appointment-details modal (speciality, doctor, date/slot + terms)
 *                                                 -> "Proceed to Pay"
 *   4. payment modal (summary + "Pay Securely")   -> Cashfree gateway
 *
 * Real, un-mocked parts of the app exercised here:
 *   GET  /api/superAdmin/serviceOffered  -> consultation types + fees (Audio / Video)
 *   GET  /api/addDoctor                  -> doctor list
 *   the whole appointment page flow, server-side OTP API contract, Cashfree `load({mode:'sandbox'})`
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
const CONSULTATION_TYPE = 'Audio';
const CONSULTATION_FEE = 199;

// Sandbox artefacts returned by the mocked Cashfree order + checkout
const SANDBOX_SESSION_ID = 'sandbox_e2e_payment_session';
const ORDER_ID = 'HP_E2E_SANDBOX_ORDER_1';
const APPOINTMENT_ID = 'e2e_appointment_0001';

const REJECTED_TEST_OTP = '111000';
const VALID_TEST_OTP = '654321';

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
const DOCTORS_API = /\/api\/addDoctor\/?(\?|$)/;
const SERVICE_OFFERED_API = /\/api\/superAdmin\/serviceOffered\/?(\?|$)/;
const SLOTS_API = /\/api\/slots\/fetchSlot/;

/**
 * Fixtures for the deep-link test: the canonical speciality list (globalData SUB
 * items) and one doctor filed under it. The auto-fill only accepts a name the
 * dropdown offers, so both sides have to agree here.
 */
const DEEP_LINK_SPECIALITY = 'Dermatology';

const DEEP_LINK_DOCTOR = {
  _id: 'e2e_deep_link_doctor',
  name: 'Dr. Deep Link',
  mobileNumber: '9812345670',
  // First entry is the speciality, second is the consultation type the form books.
  serviceOffered: [DEEP_LINK_SPECIALITY, CONSULTATION_TYPE],
  consultationType: [{ name: CONSULTATION_TYPE, price: CONSULTATION_FEE }],
  workDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
  unavailableDates: [],
};

type CapturedWhatsApp = {
  method: string;
  body: { action?: string; mobile?: string; name?: string; otp?: string };
};
type CapturedOtpVerification = {
  action?: string;
  mobile?: string;
  name?: string;
  otp?: string;
};

async function mockOtpApi(
  context: BrowserContext,
  sendCalls: CapturedWhatsApp[],
  verificationCalls: CapturedOtpVerification[] = []
) {
  await context.route(WHATSAPP_CONFIRMATION_API, async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as CapturedOtpVerification;
    if (body.action === 'verify') {
      verificationCalls.push(body);
      const valid = body.otp === VALID_TEST_OTP;
      await route.fulfill({
        status: valid ? 200 : 400,
        contentType: 'application/json',
        body: JSON.stringify(
          valid
            ? { success: true, message: 'OTP verified' }
            : { error: 'Invalid or expired OTP' }
        ),
      });
      return;
    }

    sendCalls.push({
      method: request.method(),
      body: body as CapturedWhatsApp['body'],
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'OTP sent successfully' }),
    });
  });
}

/**
 * Step 1: the page card only asks for the contact details. "Continue" runs the
 * contact guard and opens the OTP modal (role="dialog").
 */
async function submitContactStep(page: Page) {
  const card = page.locator('form.appointment-form').first();

  await page.getByLabel('Name', { exact: true }).fill(TEST_NAME);
  await page.getByLabel('WhatsApp Mobile Number', { exact: true }).fill(TEST_MOBILE);
  await card.locator('.consultation-btn').click();

  const dialog = page.getByRole('dialog');
  // Under load a device can click while the bundle is still settling, which makes
  // the first press a no-op. Retry the same button before giving up.
  try {
    await expect(dialog).toBeVisible({ timeout: 10_000 });
  } catch {
    await card.locator('.consultation-btn').click();
  }
  await expect(dialog).toBeVisible();

  return dialog;
}

/** Step 3 - the fields inside the details modal that do not depend on "When". */
async function fillAppointmentDetailsFields(dialog: Locator) {
  // Bootstrap ToggleButton clips its native input (pointer-events:none), so the
  // visible chip/segment label is the real click target — click it like a user.
  // Consultation type/service is fed from the live ServiceOffered collection.
  await dialog.locator(`label[id="consultation-${CONSULTATION_TYPE}"]`).click();
  // Speciality is mandatory (the "Proceed to Pay" guard refuses without one) and
  // it also narrows the doctor list, so pick the first real option - index 0 is
  // the "Select Speciality" placeholder.
  await dialog.getByLabel('Speciality', { exact: true }).selectOption({ index: 1 });
}

/** Step 3 - full details, including "Choose Time" + date + slot + terms. */
async function fillAppointmentDetails(dialog: Locator) {
  await fillAppointmentDetailsFields(dialog);

  // Time: "Choose Time" -> date picker + slot dropdown (locally generated slots)
  await dialog.locator('label[id="when-later"]').click();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  await dialog.locator('input[type="date"]').fill(tomorrowStr);

  const slotSelect = dialog.locator('select[name="slot"]');
  await expect(slotSelect).toBeVisible();
  await slotSelect.selectOption({ index: 1 }); // index 0 is the disabled placeholder

  await dialog.getByRole('checkbox').check();
}

async function enterOtp(page: Page, code: string) {
  // The appointment form's WhatsApp mobile field is also inputmode="numeric" and
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
    const whatsappCalls: CapturedWhatsApp[] = [];
    const verificationCalls: CapturedOtpVerification[] = [];
    let bookingBody: Record<string, unknown> | undefined;
    let createOrderBody: Record<string, unknown> | undefined;
    const statusCalls: string[] = [];
    const checkoutCalls: Array<{ mode?: string; options?: Record<string, unknown> }> = [];

    const context = page.context();
    await stubCashfreeCheckout(context, checkoutCalls);

    // ── Mocked boundaries (context level, so a second page is covered too) ──
    // WhatsApp confirmation API (the OTP/WhatsApp sender). Mocked + asserted so that no
    // real WhatsApp message can leave the system during the test run.
    await mockOtpApi(context, whatsappCalls, verificationCalls);

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
    // `booking` is what pages/api/payment/status.js answers for a PAID order; the
    // thank-you page renders it as the appointment summary.
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
          booking: {
            patientName: TEST_NAME,
            mobileNumber: TEST_MOBILE,
            speciality: 'General Physician',
            doctorName: 'Dr. E2E Sandbox',
            consultationType: CONSULTATION_TYPE,
            appointmentTime: new Date().toISOString(),
            bookingMode: 'ChooseTime',
          },
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

    // ── 2. Step 1: contact details are validated before the OTP step ──
    // An empty card must not open the OTP modal.
    const card = page.locator('form.appointment-form').first();
    await card.locator('.consultation-btn').click();
    await expect(page.getByText('Please enter your name.').first()).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(whatsappCalls).toHaveLength(0);

    // An invalid mobile number is refused with the existing 10-digit message.
    await page.getByLabel('Name', { exact: true }).fill(TEST_NAME);
    await page.getByLabel('WhatsApp Mobile Number', { exact: true }).fill('12345');
    await card.locator('.consultation-btn').click();
    await expect(
      page.getByText('Please enter 10 digit in mobile number').first()
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // ── 3. Step 2: "Continue" with valid details opens the OTP modal ─
    const dialog = await submitContactStep(page);
    await expect(dialog.getByText('Verify your mobile number')).toBeVisible();

    // ── 4./11. WhatsApp confirmation API triggered with the right payload ──
    await expect.poll(() => whatsappCalls.length).toBe(1);
    expect(whatsappCalls[0].method).toBe('POST');
    expect(whatsappCalls[0].body.mobile).toBe(TEST_MOBILE);
    expect(whatsappCalls[0].body.action).toBe('send');
    expect(whatsappCalls[0].body.otp).toBeUndefined();

    // ── 6. The server rejects an incorrect OTP ─────────────────────
    await enterOtp(page, REJECTED_TEST_OTP);
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();
    await expect(dialog.getByText('Invalid or expired OTP')).toBeVisible();
    expect(verificationCalls[0]).toMatchObject({
      action: 'verify',
      mobile: TEST_MOBILE,
      name: TEST_NAME,
      otp: REJECTED_TEST_OTP,
    });

    // ...then verify with a code accepted by the mocked server API.
    await enterOtp(page, VALID_TEST_OTP);
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();
    await expect.poll(() => verificationCalls.length).toBe(2);
    expect(verificationCalls[1]).toMatchObject({
      action: 'verify',
      mobile: TEST_MOBILE,
      name: TEST_NAME,
      otp: VALID_TEST_OTP,
    });

    // ── 5. Step 3: appointment details (speciality, doctor, date, slot) ──
    await expect(dialog.getByLabel('Speciality', { exact: true })).toBeVisible();

    // The details guard refuses the request without a speciality - no booking POST.
    await dialog.locator('.consultation-btn', { hasText: 'Proceed to Pay' }).click();
    await expect(page.getByText('Please select a speciality.').first()).toBeVisible();
    await expect(dialog.locator('select.is-invalid')).toHaveCount(1);
    expect(bookingBody).toBeUndefined();

    await fillAppointmentDetails(dialog);
    await expect(dialog.getByRole('radio', { name: CONSULTATION_TYPE })).toBeChecked();
    await expect(dialog.getByRole('radio', { name: 'Choose Time' })).toBeChecked();

    // ── 6. Proceed to Pay creates the appointment (payload unchanged) ──
    await dialog.locator('.consultation-btn', { hasText: 'Proceed to Pay' }).click();

    // Booking request carries the data collected on the form.
    await expect.poll(() => bookingBody?.patientMobNo).toBe(TEST_MOBILE);
    expect(bookingBody).toMatchObject({
      name: TEST_NAME,
      patientMobNo: TEST_MOBILE,
      consultationType: CONSULTATION_TYPE,
      consultationprice: CONSULTATION_FEE,
      appointmentTime: 'ChooseTime',
    });
    // Email and "reason for consultation" are no longer collected by the flow.
    expect(bookingBody?.symptoms).toBeUndefined();
    expect(bookingBody?.email).toBeUndefined();
    expect(bookingBody?.selectedSlot).toBeTruthy();
    // The speciality name must travel to the API: it is stored on the appointment
    // and echoed by /api/payment/status so the success screen can show it.
    expect(typeof bookingBody?.serviceType).toBe('string');
    expect((bookingBody?.serviceType as string).length).toBeGreaterThan(0);

    // ── 7. Step 4: the fee + secure payment only (sandbox) ─────────
    // The appointment summary moved to the success screen: it must NOT be shown
    // before paying anymore.
    await expect(page.getByText('Booking Summary')).toHaveCount(0);
    await expect(
      page.getByText('Your appointment details will be shown once the payment is confirmed.')
    ).toBeVisible();
    await expect(page.getByText(`Consultation Fee: ₹${CONSULTATION_FEE}`)).toBeVisible();
    const payButton = page.locator('.consultation-btn', { hasText: 'Pay Securely' });
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

    // ── 9b. The appointment summary is shown here, after the payment ──
    const summary = page.getByTestId('appointment-summary');
    await expect(summary.getByText('Your appointment')).toBeVisible();
    await expect(summary.getByText(TEST_NAME)).toBeVisible();
    await expect(summary.getByText(`+91 ${TEST_MOBILE}`)).toBeVisible();
    // Scoped to the summary: the header nav also links a "General Physician".
    await expect(summary.getByText('General Physician')).toBeVisible();
    await expect(summary.getByText('Dr. E2E Sandbox')).toBeVisible();
    await expect(summary.getByText(CONSULTATION_TYPE).first()).toBeVisible();

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
    await mockOtpApi(context, whatsappCalls);

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

    const card = page.locator('form.appointment-form').first();
    await page.getByLabel('Name', { exact: true }).fill(TEST_NAME);
    await page.getByLabel('WhatsApp Mobile Number', { exact: true }).fill(TEST_MOBILE);
    await card.locator('.consultation-btn').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // OTP gate (mocked send and verification API).
    await enterOtp(page, VALID_TEST_OTP);
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();

    // Step 3: keep the default "Now" choice, so no date/slot is needed.
    const dialog = page.getByRole('dialog');
    await fillAppointmentDetailsFields(dialog);
    await expect(dialog.getByRole('radio', { name: 'Now' })).toBeChecked();
    await dialog.getByRole('checkbox').check();
    await dialog.locator('.consultation-btn', { hasText: 'Proceed to Pay' }).click();

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
    await page.locator('.consultation-btn', { hasText: 'Pay Securely' }).click();

    await expect.poll(() => createOrderBody?.appointmentId).toBe(APPOINTMENT_ID);
    await expect.poll(() => checkoutCalls.length).toBe(1);
    expect(checkoutCalls[0].mode).toBe('sandbox');
    expect(checkoutCalls[0].options?.paymentSessionId).toBe(SANDBOX_SESSION_ID);
  });

  /**
   * `/timetable` (and every doctor card) hands over `?doctorId=` only. Selecting
   * that doctor must also fill the speciality - it is a mandatory field, and the
   * appointment is stored with it (`serviceType` in the booking payload).
   */
  test('fills the speciality from the doctor handed over as ?doctorId and posts it', async ({
    page,
  }) => {
    test.slow(); // dev-server first compile + OTP + booking

    const bookingBodies: Array<Record<string, unknown>> = [];
    const whatsappCalls: CapturedWhatsApp[] = [];

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    const context = page.context();

    // Canonical speciality list: one SUB item (the dropdown option) + the MAJOR
    // consultation type the form has to offer a tile for.
    await context.route(SERVICE_OFFERED_API, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { name: DEEP_LINK_SPECIALITY, categoryType: 'SUB', isActive: true },
          {
            name: CONSULTATION_TYPE,
            categoryType: 'MAJOR',
            fee: CONSULTATION_FEE,
            isActive: true,
          },
        ]),
      });
    });

    // A single doctor, filed under that speciality - nothing else can fill it in.
    await context.route(DOCTORS_API, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([DEEP_LINK_DOCTOR]),
      });
    });

    // The `date` half of the deep link makes the page ask for that day's grid.
    await context.route(SLOTS_API, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await mockOtpApi(context, whatsappCalls);

    await context.route(BOOK_CONSULTATION_API, async (route) => {
      bookingBodies.push(route.request().postDataJSON() as Record<string, unknown>);
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

    await context.route(/fast2sms/i, async (route) => {
      await route.abort('blockedbyclient');
    });

    // ── 1. Land the way the timetable does ──────────────────────────
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deepLinkDate = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    await page.goto(
      `/appointment?doctorId=${DEEP_LINK_DOCTOR._id}&date=${deepLinkDate}&time=09:00`
    );
    await expect(page.getByRole('heading', { name: 'Make Appointment' })).toBeVisible({
      timeout: PAGE_READY_TIMEOUT,
    });

    // ── 2. Contact details + OTP (mocked send and verification API) ─
    await submitContactStep(page);
    await enterOtp(page, VALID_TEST_OTP);
    await page.locator('.consultation-btn', { hasText: 'Verify' }).click();

    const dialog = page.getByRole('dialog');
    const specialitySelect = dialog.getByLabel('Speciality', { exact: true });
    await expect(specialitySelect).toBeVisible();

    // ── 3. Doctor and speciality both come from the URL, not from a click ──
    await expect(dialog.getByLabel('Doctor', { exact: true })).toHaveValue(
      DEEP_LINK_DOCTOR._id
    );
    await expect(specialitySelect).toHaveValue(DEEP_LINK_SPECIALITY);
    expect(whatsappCalls).toHaveLength(1);

    // ── 4. The auto-filled speciality is what the booking carries ───
    // "Now" keeps the flow free of the (empty, mocked) slot grid.
    await dialog.locator('label[id="when-now"]').click();
    await dialog.getByRole('checkbox').check();
    await dialog.locator('.consultation-btn', { hasText: 'Proceed to Pay' }).click();

    await expect.poll(() => bookingBodies.length).toBe(1);
    expect(bookingBodies[0]).toMatchObject({
      selectedDoctorId: DEEP_LINK_DOCTOR._id,
      patientMobNo: TEST_MOBILE,
      serviceType: DEEP_LINK_SPECIALITY,
    });
  });
});
