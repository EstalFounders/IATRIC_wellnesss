import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import Payment from "../../../src/models/paymentSchema";
import { payment_status } from "../../../src/constant";
import { logErrorToGoogleSheet } from "../helper";

// Start of the requested window. `today` has to be the beginning of the current
// day (the old code compared `appointmentTime` to `new Date()` for equality, which
// never matched a real booking).
const timeframeStart = (timeframe) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (timeframe) {
    case "today":
      return start;
    case "week":
      start.setDate(start.getDate() - 7);
      return start;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      return start;
    case "month":
    default:
      start.setMonth(start.getMonth() - 1);
      return start;
  }
};

// Money actually received for one appointment:
//   amountAfterOffer - what Cashfree captured (offers are applied on the hosted
//                      checkout, so the stored prices stay at the list price)
//   payment.amount   - fallback for older payments that were never reconciled
//   consultationprice - last resort, only when neither of the above exists
const collectedAmount = (appointment, payment) => {
  if (appointment.amountAfterOffer != null) {
    return Number(appointment.amountAfterOffer) || 0;
  }
  const paidAmount = Number(payment?.amount);
  if (Number.isFinite(paidAmount) && paidAmount > 0) return paidAmount;
  return Number(appointment.consultationprice) || 0;
};

export default async function handler(req, res) {
  await dbConnect();

  const { doctorId, timeframe } = req.query;

  if (!doctorId) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  const startDate = timeframeStart(timeframe);

  try {
    const allAppointments = await Appointment.find({ doctorId: doctorId }).select(
      "consultationprice amountAfterOffer appointmentTime paymentId",
    );

    // Payments are looked up for this doctor's appointments only: through the
    // canonical `appointment.paymentId` link and through `Payment.appointmentId`,
    // which is what older / manually settled records have.
    const appointmentIds = allAppointments.map((appointment) => appointment._id);
    const linkedPaymentIds = allAppointments
      .map((appointment) => appointment.paymentId)
      .filter(Boolean);

    const payments = appointmentIds.length
      ? await Payment.find({
          $or: [
            { appointmentId: { $in: appointmentIds } },
            { _id: { $in: linkedPaymentIds } },
          ],
        }).select("appointmentId amount status")
      : [];

    const paidByAppointmentId = new Map();
    const paymentsById = new Map();
    payments.forEach((payment) => {
      paymentsById.set(String(payment._id), payment);
      if (payment.status !== payment_status.PAID) return;
      if (payment.appointmentId) {
        paidByAppointmentId.set(String(payment.appointmentId), payment);
      }
    });

    // Only appointments whose money arrived. A PENDING/OPEN booking, a failed
    // payment or a refunded one (REFUNDED / REFUND_PENDING) never counts, while a
    // paid consultation keeps counting after it is marked COMPLETED.
    const paidAppointments = allAppointments
      .map((appointment) => {
        const payment =
          paidByAppointmentId.get(String(appointment._id)) ||
          (appointment.paymentId
            ? paymentsById.get(String(appointment.paymentId))
            : null);

        if (!payment || payment.status !== payment_status.PAID) return null;
        return {
          appointmentTime: appointment.appointmentTime,
          amount: collectedAmount(appointment, payment),
        };
      })
      .filter(Boolean);

    const sumAmounts = (rows) => rows.reduce((sum, row) => sum + row.amount, 0);

    const timeframeAppointments = paidAppointments.filter(
      (row) => row.appointmentTime && row.appointmentTime >= startDate,
    );

    const totalEarningsAllTime = sumAmounts(paidAppointments);
    const totalEarningsTimeframe = sumAmounts(timeframeAppointments);
    const totalConsultations = timeframeAppointments.length;
    const averagePerConsultation =
      totalConsultations > 0 ? totalEarningsTimeframe / totalConsultations : 0;

    const earningsSummary = {};
    timeframeAppointments.forEach((row) => {
      const dateKey = row.appointmentTime.toISOString().split("T")[0];
      if (!earningsSummary[dateKey]) {
        earningsSummary[dateKey] = { consultations: 0, earnings: 0 };
      }
      earningsSummary[dateKey].consultations += 1;
      earningsSummary[dateKey].earnings += row.amount;
    });

    const earningsArray = Object.entries(earningsSummary)
      .map(([date, data]) => ({
        date,
        consultations: data.consultations,
        earnings: Number(data.earnings.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      doctorId,
      totalEarningsAllTime: Number(totalEarningsAllTime.toFixed(2)),
      totalEarningsTimeframe: Number(totalEarningsTimeframe.toFixed(2)),
      totalConsultations,
      averagePerConsultation: Number(averagePerConsultation.toFixed(2)),
      earnings: earningsArray,
    });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    await logErrorToGoogleSheet({
      apiName: "doctorEarnings",
      errorMessage: error.message || "Failed to fetch earnings",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { doctorId, timeframe },
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
}