import { labTest_payment_status, labTest_status } from "../../../constant";

export const calculateConsultationEarning = (appointments) => {
  return appointments.reduce((total, appointment) => {
    return total + appointment.consultationprice;
  }, 0);
};

export const calculateLabTestEarning = (items) => {
  return items.reduce((total, item) => {
    const paymentStatus = item.paymentStatus || ""; // Treat undefined as empty string
    const bookingStatus = item.bookingStatus || ""; // Treat undefined as empty string
    return (
      total +
      (paymentStatus.toLowerCase() === labTest_payment_status.PAID ||
      bookingStatus.toLowerCase() === labTest_status.completed
        ? parseFloat(item.totalPrice)
        : 0)
    );
  }, 0);
};
