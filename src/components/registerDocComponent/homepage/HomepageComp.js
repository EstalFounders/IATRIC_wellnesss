import { useEffect, useState } from "react";
import { doctor_info_local_storage } from "../../../constant";
import DashboardCard from "./DashboardCard";
import DashboardSecondComp from "./DashboardSecondComp";
// import styles from "./css/HomePage.module.css";

export default function HomepageComp() {
  const [todayBookings, setTodayBookings] = useState(9);
  const [totalBookings, setTotalBookings] = useState(12);
  const [totalEarnings, setTotalEarnings] = useState(15);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let doctorId;

  const doctorInfo = JSON.parse(
    localStorage.getItem(doctor_info_local_storage)
  );
  doctorId = doctorInfo.user._id
  console.log(doctorInfo, "doctor info");

  if (!doctorInfo) {
    return null; // Prevent rendering if doctorInfo is null
  }

  const data = [
    { title: "Today's Booking", value: 23, backgroundColor: "#4caf50" },
    { title: "Total No of Booking", value: 120, backgroundColor: "#2196f3" },
    { title: "Pending Booking", value: "5", backgroundColor: "#8c8b1d" },
  ];

  const containerStyle = {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    margin: "20px",
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/bookConsultation?doctorId=${doctorId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data.appointments);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;


  return (
    <>
      <div style={containerStyle}>
        {data.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            backgroundColor={item.backgroundColor}
          />
        ))}
      </div>
      <div>
        <DashboardSecondComp appointments={appointments} />
      </div>
    </>
  );
}
