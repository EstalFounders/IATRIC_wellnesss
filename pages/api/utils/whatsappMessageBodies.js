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
    // You would call formatData and extractTime here or ensure formatted values are passed
    // For simplicity, let's assume formatted values are passed for now,
    // or you'd import and use your date/time formatters here.
    const formattedAppointmentDate = extractDate(startTime);
    const formattedAppointmentTime = extractTime(startTime);
  
    // For this example, let's make them directly passed for clarity:
  
  
    return {
      appointment_date: formattedAppointmentDate,  // Use actual formatted date
      appointment_time: formattedAppointmentTime,  // Use actual formatted time
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
  
  // --- Note on formatData and extractTime ---
  // If you want these functions to be truly self-contained and format dates,
  // you would either import formatData/extractTime from your date utility file
  // or define a simpler version directly within this file if they are only used here.
  // For example:
  // const formatDateForMessage = (timestamp) => { /* ... your date formatting logic ... */ };
  // const extractTimeForMessage = (timestamp) => { /* ... your time extraction logic ... */ };