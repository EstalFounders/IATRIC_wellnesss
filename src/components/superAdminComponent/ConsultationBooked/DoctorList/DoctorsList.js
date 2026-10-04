// components/ItemList.js
import React, { useState } from "react";
import ItemCard from "./DocItemCards";
import { Button, Col, Row, Pagination } from "react-bootstrap";
import { CustomPagination } from "../../../../helper";
import { color_schema } from "../../../../constant";

const DoctorList = ({ source, data, appointments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Calculate the indices for slicing the data array
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <div className="row">
      <div className="col">
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          className="mt-4"
        >
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Name</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Area of Expertise</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>User Remarks</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>No of Booking</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Admin Remarks</b>
          </Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.map((doctor) => {
            // Filter appointments for the current doctor
            const doctorAppointments = appointments.filter(
              (appointment) => appointment.doctorId == doctor._id
            );
            return (
              <ItemCard
                source={source}
                key={doctor._id}
                doctor={doctor}
                appointments={doctorAppointments} // Pass filtered appointments
              />
            );
          })}
        </div>
        <CustomPagination
          currentPage={currentPage}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default DoctorList;
