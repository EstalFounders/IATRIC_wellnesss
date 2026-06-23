import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  await dbConnect();

  const { doctorId, timeframe } = req.query;

  if (!doctorId) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  let startDate = new Date();

  switch (timeframe) {
    case "today":
      startDate.setDate(new Date().getDate());
      break;
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  try {
    const allAppointments = await Appointment.find({ doctorId: doctorId });

    const timeframeAppointments =
      timeframe == "today"
        ? await Appointment.find({
            doctorId: doctorId,
            appointmentTime: startDate,
          })
        : await Appointment.find({
            doctorId: doctorId,
            appointmentTime: { $gte: startDate },
          });

    const totalEarningsAllTime = allAppointments.reduce(
      (sum, a) => sum + a.consultationprice,
      0
    );

    const totalEarningsTimeframe = timeframeAppointments.reduce(
      (sum, a) => sum + a.consultationprice,
      0
    );

    const totalConsultations = timeframeAppointments.length;
    const averagePerConsultation =
      totalConsultations > 0 ? totalEarningsTimeframe / totalConsultations : 0;

    const earningsSummary = {};
    timeframeAppointments.forEach((appointment) => {
      const dateKey = appointment.appointmentTime.toISOString().split("T")[0];
      if (!earningsSummary[dateKey]) {
        earningsSummary[dateKey] = { consultations: 0, earnings: 0 };
      }
      earningsSummary[dateKey].consultations += 1;
      earningsSummary[dateKey].earnings += appointment.consultationprice;
    });

    const earningsArray = Object.entries(earningsSummary)
      .map(([date, data]) => ({
        date,
        consultations: data.consultations,
        earnings: data.earnings,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      doctorId,
      totalEarningsAllTime,
      totalEarningsTimeframe,
      totalConsultations,
      averagePerConsultation,
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