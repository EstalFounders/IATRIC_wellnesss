import { useEffect, useState } from "react";
import { api, doctor_info_local_storage } from "../../../constant";
import DashboardCard from "./DashboardCard";
import DashboardSecondComp from "./DashboardSecondComp";

export default function HomepageComp() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const doctorInfo = JSON.parse(localStorage.getItem(doctor_info_local_storage));

  const doctorId = doctorInfo.user._id;

  async function fetchAppointments(){
    try {
      const response = await fetch(`${api.bookConsultation}?doctorId=${doctorId}`);
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

    useEffect(() => {
      fetchAppointments(); // Call the fetchAppointments function when the component mounts
    }, []);

  // Early returns for loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
}
