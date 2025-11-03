import React from "react";
import { formatData } from "../../utils/helper";
import { appointment_status } from "../../../../constant";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";

const AppointmentsTable = ({ appointments, filterText }) => {
  const router = useRouter();

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        height: "100%",
        boxSizing: "border-box",
        overflowX: "auto", // Ensure horizontal scrolling on small screens
      }}
    >
      <h3 style={{ fontSize: "1.5em", textAlign: "center" }}>
        {filterText} Appointments
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f4f4f4",
              borderBottom: "2px solid #ddd",
            }}
          >
            <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Gender</th>
            <th style={{ padding: "10px", textAlign: "left" }}>
              Appointment Time
            </th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>
              Consultation Type
            </th>
            <th style={{ padding: "10px", textAlign: "left" }}>Price</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {appointment.name}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {appointment.gender || "N/A"}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {formatData(appointment.appointmentTime)}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {appointment.status}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {appointment.consultationType}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  ${appointment.consultationprice}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {appointment.status === appointment_status.completed ? (
                    <span style={{ textDecoration: "underline", cursor: "pointer", color: "blue" }}>
                      View Description
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "15px",
                  borderBottom: "1px solid #ddd",
                  fontWeight: "bold",
                  color: "#666",
                }}
              >
                No appointments available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className="text-center mt-4">
        <Button
          onClick={() =>
            router.push({
              pathname: "/registerDoc/viewAllAppointment",
              query: { type: filterText },
            })
          }
        >
          View All Appointments
        </Button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          table {
            width: 100%;
            display: block;
            overflow-x: auto;
          }
          th,
          td {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentsTable;
