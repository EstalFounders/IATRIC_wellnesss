import React, { useState, useEffect } from "react";
import { Button, Col, Row, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import Appointments from "../RecentAppointment/Appointments";
import DoctorList from "../ConsultationBooked/DoctorList/DoctorsList";
import LabList from "../LabTesBooked/LabList/LabList";

const LabListTable = ({
  source,
  doctors,
  isLoading,
  appointments,
  onStatusChanged,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDoctors, setfilteredDoctors] = useState(appointments);

  useEffect(() => {
    // Filter appointments based on search term
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = appointments.filter(
      (appointment) =>
        appointment.name.toLowerCase().includes(lowerCaseSearchTerm)
      // ||
      // appointment.status.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setfilteredDoctors(results);
  }, [searchTerm, doctors]);

  return (
    <Row
      className="w-75 ml-auto mr-auto border p-4 mb-4"
      style={{ borderRadius: 20 }}
    >
      <Row className="w-100 mx-2 border-bottom pb-1">
        <Col className="mt-3 text-left">
          <h4>
            <b>Total</b>
          </h4>
        </Col>
        {/* <Col className="text-right mt-2">
          <Button className="bg-secondary" href="/superAdmin/addDoctor">
            Book Appointment
          </Button>
        </Col> */}
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
                placeholder="Search by name"
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
        ) : filteredDoctors.length === 0 ? (
          <p>No Doctor found.</p>
        ) : (
          <Col>
            <LabList
              source={source}
              data={filteredDoctors}
              appointments={appointments}
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

export default LabListTable;
