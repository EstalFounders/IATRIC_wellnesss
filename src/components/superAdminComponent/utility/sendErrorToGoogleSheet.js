import { api } from "../../../constant";

/**
 * Error log data interface/object shape
 * @typedef {Object} ErrorLogData
 * @property {string} [timestamp] - Timestamp in ISO format
 * @property {string} patientName - Name of the patient
 * @property {string} mobileNumber - Patient's mobile number
 * @property {string} doctorName - Doctor's name
 * @property {string} consultationType - Type of consultation (Call/Video/Clinic/Home Visit)
 * @property {string} appointmentDate - Appointment date
 * @property {string} apiEndpoint - API endpoint that was called
 * @property {string} [errorCode] - Error code (HTTP status or custom code)
 * @property {string} errorMessage - Error message description
 * @property {Object} [requestPayload] - Request payload sent to the API
 * @property {Object} [responsePayload] - Response payload from the API
 * @property {string} [environment] - Environment (development/production). Auto-detected if not provided.
 */

/**
 * Get current environment string
 * @returns {string}
 */
const getEnvironment = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.includes("staging")
    ) {
      return "development";
    }
  }
  return process.env.NODE_ENV || "development";
};

/**
 * Send error details to Google Sheets for logging and monitoring.
 * This is a reusable helper that can be called from any API service.
 *
 * @param {ErrorLogData} data - The error data to log
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendErrorToGoogleSheet = async (data) => {
  try {
    const payload = {
      timestamp: data.timestamp || new Date().toISOString(),
      patientName: data.patientName || "",
      mobileNumber: data.mobileNumber || "",
      doctorName: data.doctorName || "",
      consultationType: data.consultationType || "",
      appointmentDate: data.appointmentDate
        ? new Date(data.appointmentDate).toISOString()
        : "",
      apiEndpoint: data.apiEndpoint || "",
      errorCode: data.errorCode || "",
      errorMessage: data.errorMessage || "Unknown error",
      requestPayload: data.requestPayload
        ? JSON.stringify(data.requestPayload)
        : "",
      responsePayload: data.responsePayload
        ? JSON.stringify(data.responsePayload)
        : "",
      environment: data.environment || getEnvironment(),
    };

    const response = await fetch("/api/logErrorToGoogleSheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to log error to Google Sheets:", result.message);
      return { success: false, message: result.message };
    }

    return { success: true, message: "Error logged successfully" };
  } catch (error) {
    // Fail silently - logging failure should not crash the application
    console.error("Failed to send error to Google Sheets:", error);
    return { success: false, message: error.message };
  }
};

export default sendErrorToGoogleSheet;