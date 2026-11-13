// SMS template identifiers (kept for backward compatibility with all callers)
export const WHATSAPP_REMINDER_TEMPLATE_PATIENT = "consultation_reminder_patient";
export const WHATSAPP_REMINDER_TEMPLATE_DOCTOR = "consultation_reminder_doctor";
export const WHATSAPP_CONFIRMATION_TEMPLATE = "booking_confirmation";
// Same approved template as the patient confirmation
// (FASTSMS_WA_TEMPLATE_BOOKING_ID); only the variable order is swapped so the
// doctor reads "Hello <doctor>, consultation with <patient> ..." - same pattern
// as WHATSAPP_REMINDER_TEMPLATE_DOCTOR. See smsTemplates.js.
export const WHATSAPP_CONFIRMATION_TEMPLATE_DOCTOR = "booking_confirmation_doctor";
export const WHATSAPP_PRESCRIPTION_TEMPLATE = "patient_prescription";
export const WHATSAPP_INVOICE_TEMPLATE = "consultation_invoice";
export const WHATSAPP_NUMBER_CONFIRMATION = "number_confirmation";
export const WHATSAPP_USER_QUERY_TEMPLATE = "user_query";
// Admin "Get a Callback" alert sent by POST /api/userQuery (pages/api/userQuery.js).
// The approved Fast2SMS template 38125 ("user_callback_template") has a single
// placeholder: {{1}} = the phone number of the visitor.
// Template id: FASTSMS_WA_TEMPLATE_CALLBACK_ID (blank = the caller skips the send
// instead of failing the saved request).
export const WHATSAPP_CALLBACK_REQUEST_TEMPLATE = "callback_request_admin";
// "Get a Call Back" popup alert sent to SUPPORT_NOTIFICATION_PHONE_NUMBER.
// Uses the generic WhatsApp template (FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID)
// whose 8 placeholders are filled in smsTemplates.js with
// "You got a call back request from <phone>. Please call them back ASAP.".
export const WHATSAPP_CALLBACK_SUPPORT_TEMPLATE = "callback_support_admin";
export const WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE = "doctor_credentials";

// Fast2SMS WhatsApp Business API
export const FASTSMS_API = {
  whatsapp: "https://www.fast2sms.com/dev/whatsapp",
};

export const CHANNEL_TYPE = "whatsapp";
export const WHATSAPP_TYPE = "template";

export const company_number = "7895959925"

// WhatsApp number that receives every "Get a Call Back" popup / contact-form
// submission. formatPhoneNumber() turns it into "918130654581" for Fast2SMS.
export const SUPPORT_NOTIFICATION_PHONE_NUMBER = "8130654581";

// Legacy alias kept for older imports; same recipient as the support number above.
export const admin_callback_number = SUPPORT_NOTIFICATION_PHONE_NUMBER;

// Testing switch for the "doctor added" credentials WhatsApp ONLY, i.e. the
// message built with WHATSAPP_DOCTOR_CREDENTIALS_TEMPLATE ("doctor_credentials"
// → FASTSMS_WA_TEMPLATE_DOCTOR_CREDENTIALS_ID, sent by /api/addDoctor and the
// sheet importer). While this holds a number, that one message is delivered here
// instead of to the doctor's own mobile; the body still carries the doctor's
// number and temp password. Every other WhatsApp/SMS template is unaffected.
// Set to null (or DOCTOR_CREDENTIALS_OVERRIDE_NUMBER="") to restore delivery to
// the real doctor — no code change needed.
export const DOCTOR_CREDENTIALS_OVERRIDE_PHONE_NUMBER = "8130654581";

export const IS_NOW = "Now";
