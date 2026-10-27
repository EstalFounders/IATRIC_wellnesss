// SMS template identifiers (kept for backward compatibility with all callers)
export const WHATSAPP_REMINDER_TEMPLATE_PATIENT = "consultation_reminder_patient";
export const WHATSAPP_REMINDER_TEMPLATE_DOCTOR = "consultation_reminder_doctor";
export const WHATSAPP_CONFIRMATION_TEMPLATE = "booking_confirmation";
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

// Fast2SMS WhatsApp Business API
export const FASTSMS_API = {
  whatsapp: "https://www.fast2sms.com/dev/whatsapp",
};

export const CHANNEL_TYPE = "whatsapp";
export const WHATSAPP_TYPE = "template";

export const company_number = "7895959925"

// WhatsApp number that receives every "Get a Callback" / contact-form submission.
// formatPhoneNumber() turns it into "918920897437" for Fast2SMS.
export const admin_callback_number = "8920897437";

export const IS_NOW = "Now";
