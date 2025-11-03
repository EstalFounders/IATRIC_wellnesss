import { labTest_payment_status, labTest_status } from "../../../constant";

export const calculateTotalIncome = (appointments, labTests) => {
  console.log(appointments, labTests, "all appointments and labtest");
  let totatIncome = 0;

  // Initialize totals
  let totalPrice = 0;
  let price = 0;

  // Sum up appointments
  appointments.forEach((item) => {
    price += item.consultationprice || 0;
  });

  // Sum up lab tests
  labTests.forEach((item) => {
    if (
      item.paymentStatus === labTest_payment_status.PAID ||
      item.bookingStatus === labTest_status.completed
    ) {
      totalPrice += item.totalPrice || 0;
    }
  });

  totatIncome = totalPrice + price;

  // Return the aggregated results
  return { totatIncome };
};

export const calculateDiscountedPrice = (price, discountPercentage) => {
    if (!price || !discountPercentage) return price || 0;
  
    const discountAmount = (price * discountPercentage) / 100;
    const discountedPrice = price - discountAmount;
  
    return parseFloat(discountedPrice.toFixed(2));
  };

  
