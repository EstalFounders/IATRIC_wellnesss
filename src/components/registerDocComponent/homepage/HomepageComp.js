import { useEffect, useState } from "react";
import { api, doctor_info_local_storage } from "../../../constant";
import DashboardSecondComp from "./DashboardSecond/DashboardSecondComp";
import StatsCard from "./Stats/StatsCard";
import { useDispatch, useSelector } from "react-redux";
import {
  setAppointments,
  setDoctorEarning,
  setTodaysAppointments,
} from "../../../store/slices/registerDoc/appointmentSlice";
import { useRouter } from "next/router";

export default function HomepageComp() {
  // const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterText, setFilterText] = useState("Todays");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month")
  const appointments = useSelector((state) => state.appointment.appointments);
  const doctorEarning = useSelector((state) => state.appointment.doctorEarnings);
  const todayAppointments = useSelector(
    (state) => state.appointment.todaysAppointments
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const doctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage)
  );

  const doctorId = doctorInfo.user._id;

  useEffect(() => {
    const fetchDoctorEarnings = async () => {
      try {
        const respone = await fetch(`${api.doctorEarning}?doctorId=${doctorId}&timeframe=${timeframe}`);
        if (!respone.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await respone.json();
        dispatch(setDoctorEarning(data));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorEarnings();
  }, [doctorId, timeframe]);


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
        dispatch(setAppointments(data.appointments));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the async function
    fetchAppointments();
  }, [doctorId]);

  const handleCardClick = (type) => {
    if (type === "today") {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      const todayAppointments = appointments.filter((appointment) =>
        appointment.appointmentTime.startsWith(today)
      );
      dispatch(setTodaysAppointments(todayAppointments));
      setFilteredAppointments(todayAppointments);
      setFilterText("Today");
    } else if (type === "total") {
      dispatch(setAppointments(appointments));
      setFilteredAppointments(appointments);
      setFilterText("Total");
    } else if (type === "payment") {
      router.push("/registerDoc/doctorEarnings");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const containerStyle = {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    margin: "20px",
  };

  const today = new Date().toISOString().split("T")[0];
  const todayBooking = appointments.filter((appointment) =>
    appointment.appointmentTime.startsWith(today)
  ).length;

  return (
    <>
      <div style={containerStyle}>
        <StatsCard
          todayBooking={todayBooking}
          totalEarning={doctorEarning.totalEarningsAllTime}
          totalBooking={appointments.length}
          onCardClick={handleCardClick} // Pass the click handler
        />
      </div>
      <div>
        <DashboardSecondComp
          appointments={filteredAppointments}
          filterText={filterText} // Pass the filter text
        />
      </div>
    </>
  );
}
