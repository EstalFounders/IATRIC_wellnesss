import React, { useState } from "react";
import ItemCard from "./AppointmentItemCards";
import { Col, Row, Pagination } from "react-bootstrap";
import { CustomPagination } from "../../../helper";

const Appointments = ({ data, onStatusChanged, onUpdateStatus }) => {
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
        {/* Table Header */}
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          className="mt-4"
        >
          <Col style={{ color: "#8e8333" }}>
            <b>Name</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Consultation Type</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Appointment Time</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Symptoms</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Mobile Number</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Status</b>
          </Col>
        </Row>

        {/* Items List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            maxHeight: "400px",
          }}
        >
          {currentItems.map((item) => (
            <ItemCard
              key={item._id}
              data={item}
              onStatusChanged={onStatusChanged}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>

        {/* Pagination */}
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

export default Appointments;
