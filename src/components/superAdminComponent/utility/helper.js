import { labTest_payment_status, payment_status } from "../../../constant";

// What was actually collected for a consultation.
// Cashfree offers are picked by the patient on the hosted checkout, i.e. after the
// order was created for the full fee, so `consultationprice` and `payment.amount`
// both stay at the list price. `amountAfterOffer` (written once the payment is
// reconciled) is the money that really arrived and therefore wins.
const collectedConsultationAmount = (appointment) => {
  if (appointment.amountAfterOffer != null) {
    return Number(appointment.amountAfterOffer) || 0;
  }
  const paymentAmount = Number(appointment.paymentId?.amount);
  if (Number.isFinite(paymentAmount) && paymentAmount > 0) return paymentAmount;
  return Number(appointment.consultationprice) || 0;
};

// Only paid bookings count as income. `GET /api/bookConsultation` populates
// `paymentId` with `status`/`amount`, so the payment decides - not the booking
// status: a consultation keeps counting after it is marked COMPLETED, and a
// refunded payment (REFUNDED / REFUND_PENDING) drops out even though the
// appointment row still says CONFIRMED.
const isPaidConsultation = (appointment) =>
  appointment?.paymentId?.status === payment_status.PAID;

export const calculateTotalIncome = (appointments, labTests) => {
  let consultationIncome = 0;
  let labTestIncome = 0;

  (Array.isArray(appointments) ? appointments : []).forEach((item) => {
    if (!isPaidConsultation(item)) return;
    consultationIncome += collectedConsultationAmount(item);
  });

  // Lab tests: money received only. A completed-but-unpaid test is a receivable,
  // not income, so the old `|| bookingStatus === completed` branch is gone.
  (Array.isArray(labTests) ? labTests : []).forEach((item) => {
    if (item?.paymentStatus !== labTest_payment_status.PAID) return;
    labTestIncome += Number(item.totalPrice) || 0;
  });

  // `totatIncome` keeps its historical spelling - HomepageComp and StatTiles read it.
  return {
    totatIncome: consultationIncome + labTestIncome,
    consultationIncome,
    labTestIncome,
  };
};

export const calculateDiscountedPrice = (price, discountPercentage) => {
  if (!price || !discountPercentage) return price || 0;

  const discountAmount = (price * discountPercentage) / 100;
  const discountedPrice = price - discountAmount;

  return parseFloat(discountedPrice.toFixed(2));
};

export function priceToWords(amount) {
  const num = Math.floor(Number(amount));
  if (!num || isNaN(num)) return "";
  if (num === 0) return "Zero";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convert(n) {
    if (n < 20) return units[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
    if (n < 1000)
      return (
        units[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  }

  return convert(num);
}
