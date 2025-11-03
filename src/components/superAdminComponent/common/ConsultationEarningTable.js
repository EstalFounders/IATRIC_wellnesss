import React, { useState, useEffect } from "react";
import { Button, Col, Row, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import LabTestList from "../LabTest/LabTestsList";
import ConsultationEarningList from "../earning/ConsultationEarning/ConsultationEarningList";

const ConsultationEarningTable = ({
  heading,
  isLoading,
  appointments,
  onStatusChanged,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAppointments, setFilteredAppointments] =
    useState(appointments);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = appointments.filter((appointment) => {
      const name = appointment.name || ""; //  Treat undefined as empty string
      const status = appointment.status || ""; // Treat undefined as empty string
      return (
        name.toLowerCase().includes(lowerCaseSearchTerm) ||
        status.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    setFilteredAppointments(results);
  }, [searchTerm, appointments]);

  return (
    <Row
      className="w-75 ml-auto mr-auto border p-4 mb-4"
      style={{ borderRadius: 20 }}
    >
      <Row className="w-100 mx-2 border-bottom pb-1">
        <Col className="mt-3 text-left">
          <h4>
            <b>{heading}</b>
          </h4>
        </Col>
        <Col className="text-right mt-2">
          <Button className="bg-secondary" href="/superAdmin/addDoctor">
            Book Lab Test
          </Button>
        </Col>
      </Row>

      {/* Search bar */}
      {appointments.length === 0 ? (
        ""
      ) : (
        <Row className="w-100 mt-3">
          <Col>
            <InputGroup className="mb-3 ml-2">
              <InputGroup.Text className="mr-2">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name or status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      )}

      <Row className="ml-4 w-100 mt-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No Lab Test found.</p>
        ) : (
          <Col>
            <ConsultationEarningList
              data={filteredAppointments}
              onStatusChanged={onStatusChanged}
              onUpdateStatus={onUpdateStatus}
              className="text-center"
            />
          </Col>
        )}
      </Row>
    </Row>
  );
};

export default ConsultationEarningTable;
