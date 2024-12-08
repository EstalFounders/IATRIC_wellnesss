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
  