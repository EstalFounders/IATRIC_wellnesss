export const storeAppointmentData = (data) => {
    // Clear existing healthCheckupData from localStorage
    localStorage.removeItem("appointmentData");
    // Store new data
    localStorage.setItem("appointmentData", JSON.stringify([data]));
  };

  export const getAppointmentData = () => {
    const data = JSON.parse(localStorage.getItem("appointmentData")) || [];
    return data;
  };