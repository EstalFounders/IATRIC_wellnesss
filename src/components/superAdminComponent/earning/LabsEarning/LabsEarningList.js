// components/ItemList.js
import React, { useState } from "react";
import ItemCard from "./LabsEarningItemCards";
import { Button, Col, Row } from "react-bootstrap";
import { CustomPagination } from "../../../../helper";

const LabsEarningList = ({ source, data, appointments }) => {
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
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Name</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>User Remarks</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Admin Remarks</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Total Earning</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Mobile Number</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Bookings</b>
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

export default LabsEarningList;
