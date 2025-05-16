import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";

export default async function handler(req, res) {
  await dbConnect();

  // Get doctorId from request query or body
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
      startDate.setMonth(startDate.getMonth() - 1); // Default to one month
  }

  try {
    // Fetch all appointments for the doctor (all-time)
    const allAppointments = await Appointment.find({ doctorId: doctorId });

    // Fetch appointments within the selected timeframe
    const timeframeAppointments =
      timeframe == "today"
        ? await Appointment.find({
            doctorId: doctorId,
            appointmentTime: startDate, // Filter by timeframe
          })
        : await Appointment.find({
            doctorId: doctorId,
            appointmentTime: { $gte: startDate }, // Filter by timeframe
          });

    console.log(timeframeAppointments, "appointment", doctorId, startDate);

    // Calculate total earnings for all-time
    const totalEarningsAllTime = allAppointments.reduce(
      (sum, a) => sum + a.consultationprice,
      0
    );

    // Calculate total earnings for the selected timeframe
    const totalEarningsTimeframe = timeframeAppointments.reduce(
      (sum, a) => sum + a.consultationprice,
      0
    );

    const totalConsultations = timeframeAppointments.length;
    const averagePerConsultation =
      totalConsultations > 0 ? totalEarningsTimeframe / totalConsultations : 0;

    // Aggregate earnings by date within the timeframe
    const earningsSummary = {};
    timeframeAppointments.forEach((appointment) => {
      const dateKey = appointment.appointmentTime.toISOString().split("T")[0]; // YYYY-MM-DD format
      if (!earningsSummary[dateKey]) {
        earningsSummary[dateKey] = { consultations: 0, earnings: 0 };
      }
      earningsSummary[dateKey].consultations += 1;
      earningsSummary[dateKey].earnings += appointment.consultationprice;
    });

    // Convert object to sorted array for frontend
    const earningsArray = Object.entries(earningsSummary)
      .map(([date, data]) => ({
        date,
        consultations: data.consultations,
        earnings: data.earnings,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      doctorId,
      totalEarningsAllTime, // Lifetime earnings
      totalEarningsTimeframe, // Earnings within timeframe
      totalConsultations,
      averagePerConsultation,
      earnings: earningsArray,
    });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
