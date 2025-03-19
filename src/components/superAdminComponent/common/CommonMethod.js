import { labTest_payment_status, labTest_status } from "../../../constant";

export const calculateConsultationEarning = (appointments) => {
  return appointments.reduce((total, appointment) => {
    return total + appointment.consultationprice;
  }, 0);
};

export const calculateLabTestEarning = (items) => {
  return items.reduce((total, item) => {
    return (
      total +
      (item.paymentStatus.toLowerCase() === labTest_payment_status.PAID ||
      item.bookingStatus.toLowerCase() === labTest_status.completed
        ? parseFloat(item.totalPrice)
        : 0)
    );
  }, 0);
};
