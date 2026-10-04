// components/ItemList.js
import React, { useState } from "react";
import ItemCard from "./ConsultationEarnItemCards";
import { Button, Col, Row } from "react-bootstrap";
import { CustomPagination } from "../../../../helper";
import { color_schema } from "../../../../constant";

const ConsultationEarningList = ({ source, data, appointments }) => {
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
    <Row>
      <Col>
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
            <b>Booking Type</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Appointment Time</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Earning</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Mobile Number</b>
          </Col>
        </Row>
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
              // onStatusChanged={onStatusChanged}
              // onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
        <CustomPagination
          currentPage={currentPage}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Col>
    </Row>
  );
};

export default ConsultationEarningList;
