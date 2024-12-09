import React, { useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap"; // Ensure proper imports
import { useRouter } from "next/router";
import { formatData } from "../../../registerDocComponent/utils/helper";
import { appointment_status } from "../../../../constant";

const ItemCards = ({ data, onStatusChanged, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(data.status);
  const [appointmentId, setAppointmentId] = useState(data._id);
  const [filteredData, setFiltereData] = useState(data);
  const router = useRouter();

  const handleStatusChange = (e) => {
    console.log(e.target.value, "event");
    setSelectedStatus(e.target.value);
    setAppointmentId(data._id);
  };

  const handleUpdateClick = () => {
    if (onUpdateStatus) {
      onUpdateStatus({ selectedStatus, appointmentId });
    }
  };

  const handleViewAppointment = async () => {
    router.push({
      pathname: "/superAdmin/viewAppointment",
      query: { data: JSON.stringify(data) }, // Pass the appointment data as a string
    });
  };
  

  return (
    <Row
      style={{
        borderBottom: "1px solid #ccc",
        borderBottomWidth: 3,
        display: "flex",
        flexDirection: "row",
      }}
      className="mt-4"
    >
      <Col className="text-primary clickable-div" onClick={handleViewAppointment}>
        <u>{data.name}</u>
      </Col>
      <Col>{data.consultationType}</Col>
      <Col>{formatData(data.appointmentTime)}</Col>
      <Col>{data.symptoms}</Col>
      <Col>{data.patientMobNo}</Col>
    </Row>
  );
};

export default ItemCards;
