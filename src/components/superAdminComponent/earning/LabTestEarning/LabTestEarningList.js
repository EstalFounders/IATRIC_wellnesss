// components/ItemList.js
import React, { useState } from "react";
import ItemCard from "./LabTestEarnItemCards";
import { Button, Col, Row } from "react-bootstrap";
import { CustomPagination } from "../../../../helper";
import { color_schema } from "../../../../constant";

const LabTestEarningList = ({ source, data, appointments }) => {
  console.log(data, "lab test data on earning list");
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
          <Col md={3} style={{ color: color_schema.yellow }}>
            <b>Test Booked</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Booked</b>
          </Col>
          <Col md={2} className="ml-4" style={{ color: color_schema.yellow }}>
            <b>Price</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Mobile Number</b>
          </Col>
          {/* <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Status</b>
          </Col> */}
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

export default LabTestEarningList;
