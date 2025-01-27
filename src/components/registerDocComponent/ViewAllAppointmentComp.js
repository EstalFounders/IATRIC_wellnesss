import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { price_symbol } from "../../constant";
import { formatData } from "./utils/helper";
import { useRouter } from "next/router";

const ViewAllAppointmentComp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { type } = router.query;
  const appointments = useSelector((state) => state.appointment.appointments);
  const todayAppointments = useSelector((state) => state.appointment.todaysAppointments);
  const [filteredAppointments, setFilteredAppointments] = useState();
  
  useEffect(() => {
    if (type === "Total") {
      setFilteredAppointments(appointments);
      console.log('testing for 18')
    } else if (type === "Today") {
      setFilteredAppointments(todayAppointments);
      console.log('testing for 18')
    }
  }, []);

  // Handle search input
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = appointments.filter((appointment) => {
      return (
        appointment.name.toLowerCase().includes(query) ||
        // appointment.gender.toLowerCase().includes(query) ||
        appointment.appointmentTime.toLowerCase().includes(query) ||
        appointment.status.toLowerCase().includes(query) ||
        appointment.consultationType.toLowerCase().includes(query) ||
        appointment.consultationprice.toString().includes(query)
      );
    });

    setFilteredAppointments(filtered);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Appointments Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Gender</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Appointment Time
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Consultation Type
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments && filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {appointment.name}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {appointment.gender}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {formatData(appointment.appointmentTime)}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {appointment.status}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {appointment.consultationType}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {price_symbol}{appointment.consultationprice}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                style={{
                  padding: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                }}
              >
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAllAppointmentComp;
