export const storeAppointmentData = (data) => {
    // Clear existing healthCheckupData from localStorage
    sessionStorage.removeItem("appointmentData");
    // Store new data
    sessionStorage.setItem("appointmentData", JSON.stringify([data]));
  };

  export const getAppointmentData = () => {
    const data = JSON.parse(sessionStorage.getItem("appointmentData")) || [];
    return data;
  };

  export const calculateConsultationEarning = (appointments) => {
    return appointments.reduce((total, appointment) => {
      return total + appointment.price;
    }, 0);
  }

  export const calculateLabTestEarning = (items) => {
    return items.reduce((total, item) => {
      return total + (item.paymentStatus.toLowerCase() === "paid" ? parseFloat(item.totalPrice) : 0);
    }, 0);
  };
  