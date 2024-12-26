import React from "react";
import Remarks from "./Remarks";
import AppointmentsTable from "./AppointmentTable";

const DashboardSecondComp = ({ appointments }) => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "20px",
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    flex: "1",
    marginBottom: "20px",
  };
  console.log(appointments, "appont in second comp");
  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <Remarks />
        <AppointmentsTable appointments={appointments} />
      </div>
    </div>
  );
};

export default DashboardSecondComp;
