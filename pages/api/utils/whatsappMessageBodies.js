// src/utils/whatsappMessageBodies.js

import { extractTime, formatData, extractDate } from "../../../src/components/registerDocComponent/utils/helper";

// Assuming formatData and extractTime are available or passed in
// If they are utilities from your project, you'd import them here:
// import { formatData } from './dateFormatter'; // Adjust path
// import { extractTime } from './timeExtractor'; // Adjust path


/**
 * Generates the message body for a consultation confirmation.
 * @param {Date} startTime - The slot start time (Date object or timestamp).
 * @param {string} docName - The doctor's name.
 * @param {string} patientName - The patient's name.
 * @param {string} consultationType - The type of consultation.
 * @param {string} contactNo - The contact number for inquiries.
 * @returns {object} The confirmation message body.
 */
export const getConfirmMessageBody = (startTime, docName, patientName, consultationType, contactNo) => {
    // Normalize the input so extractDate/extractTime never receive null/undefined
    // or an unparseable value, which would otherwise produce "Invalid Date"
    // and break the Fast2SMS template variable payload.
    let formattedAppointmentDate = "-";
    let formattedAppointmentTime = "-";

    if (startTime) {
      const parsed = new Date(startTime);
      if (!Number.isNaN(parsed.getTime())) {
        formattedAppointmentDate = extractDate(parsed);
        formattedAppointmentTime = extractTime(parsed);
      }
    }

    return {
      appointment_date: formattedAppointmentDate,
      appointment_time: formattedAppointmentTime,
      doctor_name: docName,
      patient_name: patientName,
      consultation_type: consultationType,
      contact_us: contactNo,
    };
  };
  
  /**
   * Generates the message body for a patient's meeting reminder.
   * @param {string} doctorName - The doctor's name.
   * @param {string} patientName - The patient's name.
   * @param {string} appointmentDate - The formatted appointment date (e.g., "15/06/2026").
   * @param {string} appointmentTime - The formatted appointment time (e.g., "10:30 AM").
   * @param {string} meetingUrl - The patient's meeting URL.
   * @returns {object} The patient reminder message body.
   */
  export const getReminderMessageBodyPatient = (doctorName, patientName, appointmentDate, appointmentTime, meetingUrl) => {
    return {
      doctor_name: doctorName,
      patient_name: patientName,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      meeting_url: meetingUrl,
    };
  };
  
  /**
   * Generates the message body for a doctor's meeting reminder.
   * @param {string} doctorName - The doctor's name.
   * @param {string} patientName - The patient's name.
   * @param {string} appointmentDate - The formatted appointment date (e.g., "15/06/2026").
   * @param {string} appointmentTime - The formatted appointment time (e.g., "10:30 AM").
   * @param {string} meetingUrl - The doctor's meeting URL.
   * @returns {object} The doctor reminder message body.
   */
  export const getReminderMessageBodyDoctor = (doctorName, patientName, appointmentDate, appointmentTime, meetingUrl) => {
    return {
      doctor_name: doctorName,
      patient_name: patientName,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      meeting_url: meetingUrl,
    };
  };

  /**
   * Generates the message body for WhatsApp number confirmation.
   * @param {string} otp - The OTP for WhatsApp number confirmation.
   * @returns {object} The WhatsApp number confirmation message body.
   */
  export const getWhatsAppNumberConfirmationMessageBody = (otp) => {
    return {
      otp: otp, // OTP for WhatsApp number confirmation
    };
  };

  /**
   * Flattens arbitrary user input into a single Fast2SMS template variable.
   *
   * Fast2SMS joins the values of one template with "|" and renders them on one
   * line, so a pipe typed by the user would shift every following placeholder
   * and a line break would break the render. Values are therefore flattened,
   * replaced by `fallback` when empty and capped so a long message cannot
   * exceed WhatsApp's template variable limit.
   */
  export const asTemplateValue = (value, fallback, maxLength) => {
    if (value === undefined || value === null) return fallback;
    const text = String(value)
      .replace(/\|/g, "/")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (!text) return fallback;
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  /**
   * Value for {{1}} of the approved Fast2SMS template 38125
   * ("user_callback_template"), whose body reads "Phone Number: {{1}}".
   *
   * That template has exactly ONE variable, so the admin alert carries a single
   * value: the 10 digits of the submitted mobile number, or the email when the
   * visitor left no phone. Fast2SMS rejects a variable count that differs from
   * the template var_count.
   * @param {{mobile_number?: number|string, email?: string}} query
   * @returns {string}
   */
  export const getCallbackRequestContact = (query) => {
    const source = query || {};
    const mobile = String(source.mobile_number ?? "")
      .replace(/\D/g, "")
      .slice(-10);

    if (/^\d{10}$/.test(mobile)) return mobile;

    return asTemplateValue(source.email, "not provided", 80);
  };
  
  // --- Note on formatData and extractTime ---
  // If you want these functions to be truly self-contained and format dates,
  // you would either import formatData/extractTime from your date utility file
  // or define a simpler version directly within this file if they are only used here.
  // For example:
  // const formatDateForMessage = (timestamp) => { /* ... your date formatting logic ... */ };
  // const extractTimeForMessage = (timestamp) => { /* ... your time extraction logic ... */ };
