import { useEffect, useState } from "react";
import { api, doctor_info_local_storage } from "../../../constant";
import DashboardSecondComp from "./DashboardSecond/DashboardSecondComp";
import StatsCard from "./Stats/StatsCard";

export default function HomepageComp() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayBooking = 12;
  const totalEarning = 1250.75;

  const doctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage)
  );

  const doctorId = doctorInfo.user._id;

  useEffect(() => {
    // Define async function within useEffect
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${api.bookConsultation}?doctorId=${doctorId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await response.json();
        setAppointments(data.appointments);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the async function
    fetchAppointments();
  }, [doctorId]); // Dependency array

  // Early returns for loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const containerStyle = {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    margin: "20px",
  };

  return (
    <>
      <div style={containerStyle}>
        <StatsCard todayBooking={todayBooking} totalEarning={totalEarning} />
      </div>
      <div>
        <DashboardSecondComp appointments={appointments} />
      </div>
    </>
  );
}
